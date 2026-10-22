
import jwt from 'jsonwebtoken';
import { UserTier } from '../orchestrationConfig';
import { config } from '../config';

export interface MobileUser {
  id: string;
  email: string;
  tier: UserTier;
}

export class MobileAuthService {
  private secret: string;
  private refreshSecret: string;

  constructor(secret: string, refreshSecret: string) {
    this.secret = secret;
    this.refreshSecret = refreshSecret;
  }

  /**
   * Generate a JWT and a Refresh Token for mobile clients.
   */
  generateTokens(user: MobileUser) {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, tier: user.tier },
      this.secret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      this.refreshSecret,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify an Access Token.
   */
  verifyAccessToken(token: string): MobileUser {
    try {
      const decoded = jwt.verify(token, this.secret) as any;
      return { id: decoded.userId, email: decoded.email, tier: decoded.tier };
    } catch (err) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Refresh an Access Token using a Refresh Token.
   */
  refreshAccessToken(refreshToken: string, user: MobileUser): string {
    try {
      jwt.verify(refreshToken, this.refreshSecret);
      const { accessToken } = this.generateTokens(user);
      return accessToken;
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Middleware for mobile API requests.
   */
  authenticateMobile() {
    return (req: any, res: any, next: any) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) return res.status(401).json({ error: 'Missing token' });

      try {
        const user = this.verifyAccessToken(token);
        req.user = user;
        next();
      } catch (err: any) {
        return res.status(403).json({ error: err.message });
      }
    };
  }
}

export const mobileAuthService = new MobileAuthService(
  config.auth.jwtSecret,
  config.auth.jwtRefreshSecret
);
