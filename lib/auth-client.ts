import jwt from 'jsonwebtoken';

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

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  const secret = process.env.NEXT_PUBLIC_JWT_SECRET || 'fallback-secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.NEXT_PUBLIC_JWT_SECRET || 'fallback-secret';
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
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
