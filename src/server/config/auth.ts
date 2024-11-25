import { AuthOptions } from '../types/auth';

const authConfig: AuthOptions = {
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',
  jwtExpiresIn: '7d',
  cookieName: 'cabinet_quote_token',
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export default authConfig;