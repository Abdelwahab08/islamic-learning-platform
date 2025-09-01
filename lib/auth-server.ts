import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { executeQuerySingle } from './db';

export interface User {
  id: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'ACADEMIC_MOD';
  email: string;
  is_approved: boolean;
  onboarding_status: 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED';
  teacher_verified?: boolean;
  current_stage_id?: string;
  current_page?: number;
  redirect_path: string;
}

export interface JWTPayload {
  userId: string;
  role: string;
  email: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Get user from token
export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await executeQuerySingle<User>(
      'SELECT u.id, u.email, u.role, u.is_approved, u.onboarding_status, u.first_name, u.last_name FROM users u WHERE u.id = ?',
      [payload.userId]
    );

    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

// Get current user from cookies (server-side)
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) return null;
    
    return await getUserFromToken(token);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Set auth cookie (server-side)
export async function setAuthCookie(userId: string, role: string, email: string) {
  const token = generateToken({ userId, role, email });
  const cookieStore = await cookies();
  
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

// Clear auth cookie (server-side)
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}
