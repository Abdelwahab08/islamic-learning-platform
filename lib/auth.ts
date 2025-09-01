import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

// Get current user from cookies (client-side)
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Set auth cookie (client-side)
export async function setAuthCookie(userId: string, role: string, email: string) {
  const token = generateToken({ userId, role, email });
  
  // Set cookie via API
  await fetch('/api/auth/set-cookie', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
    credentials: 'include',
  });
}

// Clear auth cookie (client-side)
export async function clearAuthCookie() {
  await fetch('/api/auth/clear-cookie', {
    method: 'POST',
    credentials: 'include',
  });
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

// Check if user has specific role
export async function hasRole(role: string): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

// Check if user is approved
export async function isApproved(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.is_approved === true;
}
