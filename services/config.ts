const env = typeof process !== 'undefined' ? process.env : {
  NODE_ENV: 'development',
};

export const isDev = env.NODE_ENV === 'development' || !env.NODE_ENV;

// Safe JWT Secret Generation for Development
const getDevSecret = (name: string) => {
  if (env[name]) return env[name]!;
  
  if (isDev) {
    let tempSecret = '';
    // Use globalThis.crypto if available (both modern Node and Browser)
    if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
      const arr = new Uint8Array(32);
      globalThis.crypto.getRandomValues(arr);
      tempSecret = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Simple pseudo-random fallback just in case
      tempSecret = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }
    console.warn(`[Config] WARNING: ${name} is missing. Generated temporary secret for development: ${tempSecret.substring(0, 8)}...`);
    return tempSecret;
  }
  
  return '';
};

const cleanEnvString = (val?: string): string => {
  if (!val) return '';
  let trimmed = val.trim();

  // 1. Strip leading and trailing urlencoded quotes before decoding
  trimmed = trimmed
    .replace(/^%22|%22$/gi, '')
    .replace(/^%27|%27$/gi, '');

  // 2. Unescape common escape patterns
  trimmed = trimmed
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

  try {
    trimmed = decodeURIComponent(trimmed);
  } catch (e) {
    // Fallback if decodeURIComponent fails
  }

  // 3. Strip nested quotes
  let prev = '';
  while (prev !== trimmed) {
    prev = trimmed;
    trimmed = trimmed.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      trimmed = trimmed.substring(1, trimmed.length - 1);
    }
  }

  // 4. Exact match of redis:// or rediss:// connection URI if embedded
  const redisMatch = trimmed.match(/(rediss?:\/\/[^\s"'\\]+)/i);
  if (redisMatch) {
    let matchedUrl = redisMatch[1];
    // Strip trailing percent encoded quotes or residual quotes
    matchedUrl = matchedUrl.replace(/%22$/gi, '').replace(/%27$/gi, '');
    return matchedUrl;
  }

  return trimmed;
};

const rawRedisUrl = cleanEnvString(env.REDIS_URL || env.UPSTASH_REDIS_URL);

export const config = {
  isDev,
  gemini: {
    apiKey: env.GEMINI_API_KEY || '',
  },
  fal: {
    apiKey: env.FAL_KEY || '',
  },
  stripe: {
    apiKey: env.STRIPE_SECRET_KEY || '',
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
    developmentBillingMode: isDev && !env.STRIPE_SECRET_KEY,
  },
  paypal: {
    clientId: env.PAYPAL_CLIENT_ID || 'AdPzgSuHEokz6lhDlJo64kWLJeft4gq0edeNz2m22iWmkjoaAUyxx_bSfACN6a7vGEOsL9xQXfNFmcLa',
    clientSecret: env.PAYPAL_CLIENT_SECRET || 'EI3puzAeBJaoHVR3WeqEemDaUag1ahAsykEDe01tepL8l9hb1xC-HezFvdFhigPvDz64aZacGJe1K76D',
    environment: env.PAYPAL_ENVIRONMENT || 'live',
    webhookId: env.PAYPAL_WEBHOOK_ID || '',
    apiUrl: (env.PAYPAL_ENVIRONMENT || 'live') === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com',
  },
  r2: {
    bucket: env.CLOUDFLARE_R2_BUCKET || 'algoedit-storage',
    endpoint: env.CLOUDFLARE_R2_ENDPOINT || '',
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    region: 'auto',
    useMockStorage: isDev && (!env.CLOUDFLARE_R2_ACCESS_KEY_ID || !env.CLOUDFLARE_R2_SECRET_ACCESS_KEY),
  },
  cloudflare: {
    apiToken: env.CLOUDFLARE_API_TOKEN || '',
    accountId: env.CLOUDFLARE_ACCOUNT_ID || '',
  },
  openrouter: {
    apiKey: env.OPENROUTER_API_KEY || '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',
  },
  redis: {
    url: rawRedisUrl,
    useMockRedis: isDev && !rawRedisUrl,
    restUrl: cleanEnvString(env.UPSTASH_REDIS_REST_URL),
    restToken: cleanEnvString(env.UPSTASH_REDIS_REST_TOKEN),
  },
  auth: {
    jwtSecret: getDevSecret('JWT_SECRET'),
    jwtRefreshSecret: getDevSecret('JWT_REFRESH_SECRET'),
  }
};

// Validation for production
if (typeof window === 'undefined' && !isDev) {
  if (!config.fal.apiKey) throw new Error("FAL_KEY is required in production.");
  if (!config.stripe.apiKey) console.warn("[Config] STRIPE_SECRET_KEY is missing in production.");
  if (!config.r2.accessKeyId) console.warn("[Config] Cloudflare R2 credentials missing in production.");
}
