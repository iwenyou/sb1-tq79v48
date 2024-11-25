export interface AuthOptions {
  jwtSecret: string;
  jwtExpiresIn: string;
  cookieName: string;
  cookieMaxAge: number;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}