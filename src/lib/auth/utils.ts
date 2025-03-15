import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw error;
  }
}

export async function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '24h', // Token expires in 24 hours
  });
}

export function isValidToken(token: string): boolean {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return false;
    }

    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
} 