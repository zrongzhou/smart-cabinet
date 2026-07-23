import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET_RAW = process.env.JWT_SECRET;
if (!JWT_SECRET_RAW) {
  throw new Error('[auth] JWT_SECRET is not configured');
}
const JWT_SECRET: string = JWT_SECRET_RAW;
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate JWT access token (7 days expiration)
 */
export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role } as JwtPayload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Generate refresh token (30 days expiration)
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

/**
 * Verify JWT token and return payload or null
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Verify refresh token and return userId or null
 */
export function verifyRefreshToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
    if (payload.type !== 'refresh') return null;
    return payload.userId;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Hash password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
