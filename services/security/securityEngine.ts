import express from 'express';
import crypto from 'crypto';
import { adminAuth } from '../firebaseAdmin';
import { logger, LogCategory } from './logger';
import { isDev, config } from '../config';

// 1. Storage Size Limits by Subscription Plan Class
const MAX_FREE_FILE_SIZE = 15 * 1024 * 1024;       // 15 MB
const MAX_PRO_FILE_SIZE = 100 * 1024 * 1024;       // 100 MB
const MAX_CREATOR_FILE_SIZE = 500 * 1024 * 1024;   // 500 MB
const MAX_BUSINESS_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB

// 2. Format / Mime Validations
const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/tiff', 'image/x-icon',
  // Videos
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska',
  // Audio
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/aac',
  // Documents / Configurations
  'application/json', 'text/plain', 'text/html', 'text/css', 'text/javascript'
]);

const SUSPICIOUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.sh', '.com', '.cmd', '.vbs', '.scr', '.msi', '.jar', '.elf', '.dll'
]);

// rate limit tracking store
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitStores: Map<string, Map<string, RateLimitRecord>> = new Map();

/**
 * Creates an Express rate-limiting middleware using high-performance state checking.
 */
export function rateLimiter(key: string, limit: number, windowMs: number, customMessage: string) {
  if (!rateLimitStores.has(key)) {
    rateLimitStores.set(key, new Map());
  }
  const store = rateLimitStores.get(key)!;

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] as string || '127.0.0.1';
    const now = Date.now();
    
    let userRecord = store.get(ip);
    if (!userRecord || now > userRecord.resetTime) {
      userRecord = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    userRecord.count++;
    store.set(ip, userRecord);

    const remaining = Math.max(0, limit - userRecord.count);
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(userRecord.resetTime / 1000));

    if (userRecord.count > limit) {
      logger.warn({
        category: LogCategory.SECURITY,
        event: `Rate limit hit on route: ${req.path}`,
        ip,
        metadata: { limit, count: userRecord.count, path: req.path }
      });

      return res.status(429).json({
        error: 'TOO_MANY_REQUESTS',
        message: customMessage,
        retryAfterSeconds: Math.ceil((userRecord.resetTime - now) / 1000)
      });
    }

    next();
  };
}

/**
 * Standard security response headers middleware
 */
export function configureSecurityHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https: 'unsafe-inline' 'unsafe-eval' data: blob:; " +
    "img-src 'self' https: data: blob:; " +
    "media-src 'self' https: data: blob:; " +
    "connect-src 'self' https: wss:; " +
    "frame-ancestors 'self' https://ai.studio https://*.ai.studio https://*.google.com https://*.googleusercontent.com https://*.run.app;"
  );
  // Disable MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Enforce HSTS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Cross-Origin policies
  res.setHeader('X-XSS-Protection', '1; mode=block');

  next();
}

/**
 * Verify Cloudflare Turnstile or Google reCAPTCHA
 */
export async function verifyCaptcha(token: string, ip: string): Promise<boolean> {
  if (!token) return false;
  if (isDev && (token === 'simulate-captcha-passed' || token === 'guest-sandbox-pass')) {
    return true;
  }

  // Support both Turnstile and reCAPTCHA falling back from environment variables
  const captchaSecret = process.env.TURNSTILE_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY;
  if (!captchaSecret) {
    logger.warn({
      category: LogCategory.SECURITY,
      event: 'CAPTCHA Verification bypassed: Missing TURNSTILE_SECRET_KEY or RECAPTCHA_SECRET_KEY'
    });
    return true; // Bypass gracefully if secret configuration is missing in environment
  }

  try {
    const verificationUrl = process.env.TURNSTILE_SECRET_KEY 
      ? 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
      : 'https://www.google.com/recaptcha/api/siteverify';

    const params = new URLSearchParams({
      secret: captchaSecret,
      response: token,
      remoteip: ip
    });

    const verifyResponse = await fetch(verificationUrl, {
      method: 'POST',
      body: params
    });

    if (!verifyResponse.ok) return false;

    const resData = await verifyResponse.json();
    return !!resData.success;
  } catch (err: any) {
    logger.error({
      category: LogCategory.SERVER,
      event: 'CAPTCHA token check error',
      errorMessage: err.message,
      exception: err
    });
    return false;
  }
}

/**
 * Input fields cleaning and validation functions
 */
export function sanitizeString(val: any): string {
  if (typeof val !== 'string') return '';
  
  // 1. Strip script tags (XSS protection)
  let cleaned = val.replace(/<script[^>]*?>[\s\S]*?<\/script>/gi, '');
  // 2. Strip generic HTML tags (XSS protection)
  cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');
  // 3. Escape single quotes to prevent SQL injection in database fields
  cleaned = cleaned.replace(/'/g, "''");
  // 4. Remove common SQL injection sequences
  cleaned = cleaned.replace(/UNION\s+SELECT/gi, '');
  cleaned = cleaned.replace(/--/g, '');
  
  return cleaned.trim();
}

/**
 * Express input sanitizer middleware running on body/json payload
 */
export function sanitizeRequestPayload(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    }
  }
  next();
}

/**
 * CSRF Protection Middleware
 * Verifies that Origin or Referer header matches allowed domains for state-changing requests,
 * or verifies the presence of secure Authorization Bearer tokens.
 */
export function csrfGuard(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  // Authorization headers are naturally safe from CSRF (browsers do not attach them on cross-origin page forms)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  const origin = req.headers['origin'] as string;
  const referer = req.headers['referer'] as string;

  const devUrl = "https://ais-dev-rosawfzwgoqac6egsaum7x-145278888165.asia-east1.run.app";
  const preUrl = "https://ais-pre-rosawfzwgoqac6egsaum7x-145278888165.asia-east1.run.app";
  const localhost = "http://localhost:3000";

  const isAllowedOrigin = (url: string) => {
    if (!url) return false;
    return url.startsWith(devUrl) || url.startsWith(preUrl) || url.startsWith(localhost) || url.startsWith("https://ai.studio");
  };

  if ((origin && !isAllowedOrigin(origin)) || (referer && !isAllowedOrigin(referer))) {
    logger.warn({
      category: LogCategory.SECURITY,
      event: 'CSRF attack blocked: Origin/Referer mismatch',
      metadata: { origin, referer, path: req.path }
    });
    return res.status(403).json({ error: 'CSRF_BLOCKED', message: 'Cross-Origin state change request blocked.' });
  }

  next();
}

/**
 * Validates S3 keys and file parameters to block path traversal, size excesses, and suspicious content
 */
export function validateUploadParameters(userId: string, key: string, fileSize: number, contentType: string, plan: string = 'Free') {
  // Check for path traversal attacks
  if (!key || key.includes('..') || key.includes('\\') || key.includes('\0')) {
    throw new Error('PATH_TRAVERSAL_DETECTED');
  }

  // Strictly enforce plan constraints for size limits
  let maxSize = MAX_FREE_FILE_SIZE;
  if (plan === 'Pro') maxSize = MAX_PRO_FILE_SIZE;
  else if (plan === 'Creator') maxSize = MAX_CREATOR_FILE_SIZE;
  else if (plan === 'Business') maxSize = MAX_BUSINESS_FILE_SIZE;

  if (fileSize > maxSize) {
    throw new Error('FILE_SIZE_EXCEEDED_PLAN_LIMIT');
  }

  // Extract and check extension
  const cleanKey = key.toLowerCase();
  const fileExtension = cleanKey.substring(cleanKey.lastIndexOf('.'));
  
  if (SUSPICIOUS_EXTENSIONS.has(fileExtension)) {
    throw new Error('BLOCKED_EXECUTABLE_OR_SUSPICIOUS_FILE_TYPE');
  }

  if (contentType && !ALLOWED_MIME_TYPES.has(contentType)) {
    // Graceful check: standard images/video, plain/text formatting, etc.
    // If not standard, block it to prevent uploads of unapproved server binaries
    throw new Error('BLOCKED_UNSUPPORTED_MIME_TYPE');
  }

  return true;
}

/**
 * Authenticates user tokens and validates project/file ownership
 */
export type AuthenticatedRequest = express.Request & {
  userUid?: string;
  userEmail?: string;
};

export async function authenticateFirebaseToken(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Proceed as guest session if no header, backend route verifies authorization selectively
  }

  const token = authHeader.substring(7);
  try {
    const verifiedToken = await adminAuth.verifyIdToken(token);
    req.userUid = verifiedToken.uid;
    req.userEmail = verifiedToken.email;
    next();
  } catch (error: any) {
    logger.warn({
      category: LogCategory.AUTH,
      event: 'Firebase ID Token signature verification failed',
      errorMessage: error.message
    });
    return res.status(401).json({ error: 'INVALID_AUTH_TOKEN', message: 'The session has expired.' });
  }
}

/**
 * Asserts ownership of resources for active operations
 */
export function enforceOwnership(req: AuthenticatedRequest, targetUserId: string) {
  if (isDev && (!req.userUid || req.userUid === 'simulate-tester-user')) {
    return true; // Bypass in simulation/dev UI
  }
  if (!req.userUid) {
    throw new Error('UNAUTHORIZED_ACCESS_REQUIRED');
  }
  if (req.userUid !== targetUserId) {
    throw new Error('ACCESS_DENIED_OWNERSHIP_MISMATCH');
  }
  return true;
}
