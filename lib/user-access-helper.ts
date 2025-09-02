import { executeQuery } from '@/config/database'

export interface UserAccess {
  id: string
  email: string
  password_hash?: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'ACADEMIC_MOD'
  is_approved: 0 | 1 | boolean
  onboarding_status?: string
  first_name?: string
  last_name?: string
  redirect_path?: string
  role_name_ar?: string
}

export async function getUserAccessByEmail(email: string): Promise<UserAccess | null> {
  try {
    const query = `
      SELECT u.id, u.email, u.password_hash, u.role, u.is_approved, u.onboarding_status, u.first_name, u.last_name
      FROM users u WHERE u.email = ? LIMIT 1
    `
    const result = await executeQuery<UserAccess>(query, [email])
    if (!Array.isArray(result) || result.length === 0) return null
    const user = result[0]
    user.redirect_path = getRedirectPath(user.role as string, Boolean(user.is_approved))
    user.role_name_ar = getRoleNameAr(user.role as string)
    return user
  } catch (error) {
    console.error('❌ Error getting user access by email:', error)
    return null
  }
}

export async function getUserAccessById(userId: string): Promise<UserAccess | null> {
  try {
    const query = `
      SELECT u.id, u.email, u.password_hash, u.role, u.is_approved, u.onboarding_status, u.first_name, u.last_name
      FROM users u WHERE u.id = ? LIMIT 1
    `
    const result = await executeQuery<UserAccess>(query, [userId])
    if (!Array.isArray(result) || result.length === 0) return null
    const user = result[0]
    user.redirect_path = getRedirectPath(user.role as string, Boolean(user.is_approved))
    user.role_name_ar = getRoleNameAr(user.role as string)
    return user
  } catch (error) {
    console.error('❌ Error getting user access by ID:', error)
    return null
  }
}

export async function getAllUsersAccess(): Promise<UserAccess[]> {
  try {
    const query = `
      SELECT u.id, u.email, u.role, u.is_approved, u.onboarding_status, u.first_name, u.last_name
      FROM users u ORDER BY u.created_at DESC
    `
    const result = await executeQuery<UserAccess>(query)
    if (!Array.isArray(result)) return []
    return result.map(user => ({
      ...user,
      redirect_path: getRedirectPath(user.role as string, Boolean(user.is_approved)),
      role_name_ar: getRoleNameAr(user.role as string)
    }))
  } catch (error) {
    console.error('❌ Error getting all users access:', error)
    return []
  }
}

export async function getUsersByRole(role: string): Promise<UserAccess[]> {
  try {
    const query = `
      SELECT u.id, u.email, u.role, u.is_approved, u.onboarding_status, u.first_name, u.last_name
      FROM users u WHERE u.role = ? ORDER BY u.created_at DESC
    `
    const result = await executeQuery<UserAccess>(query, [role])
    if (!Array.isArray(result)) return []
    return result.map(user => ({
      ...user,
      redirect_path: getRedirectPath(user.role as string, Boolean(user.is_approved)),
      role_name_ar: getRoleNameAr(user.role as string)
    }))
  } catch (error) {
    console.error('❌ Error getting users by role:', error)
    return []
  }
}

function getRedirectPath(role: string, isApproved: boolean): string {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin'
    case 'TEACHER':
      return isApproved ? '/dashboard/teacher' : '/auth/awaiting-approval?type=teacher'
    case 'STUDENT':
      return isApproved ? '/dashboard/student' : '/auth/awaiting-approval?type=student'
    case 'ACADEMIC_MOD':
      return '/dashboard/admin'
    default:
      return '/'
  }
}

function getRoleNameAr(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'المدير'
    case 'TEACHER':
      return 'المعلم'
    case 'STUDENT':
      return 'الطالب'
    case 'ACADEMIC_MOD':
      return 'المشرف الأكاديمي'
    default:
      return 'مستخدم'
  }
}


