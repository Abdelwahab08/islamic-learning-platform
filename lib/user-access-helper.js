import { executeQuery } from '@/config/database';

/**
 * Get user access information by email (replaces v_user_access view)
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User access object or null
 */
export async function getUserAccessByEmail(email) {
  try {
    const query = `
      SELECT u.id, u.email, u.password_hash, u.role, u.is_approved, u.onboarding_status, u.first_name, u.last_name
      FROM users u WHERE u.email = ? LIMIT 1
    `;
    const result = await executeQuery(query, [email]);
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    const user = result[0];
    
    // Add computed fields that the view used to provide
    user.redirect_path = getRedirectPath(user.role, user.is_approved);
    user.role_name_ar = getRoleNameAr(user.role);
    
    return user;
  } catch (error) {
    console.error('❌ Error getting user access by email:', error);
    return null;
  }
}

/**
 * Get user access information by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User access object or null
 */
export async function getUserAccessById(userId) {
  try {
    const query = `
      SELECT u.id, u.email, u.password_hash, u.role, u.is_approved, u.onboarding_status, u.first_name, u.last_name
      FROM users u WHERE u.id = ? LIMIT 1
    `;
    const result = await executeQuery(query, [userId]);
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      return null;
    }
    
    const user = result[0];
    user.redirect_path = getRedirectPath(user.role, user.is_approved);
    user.role_name_ar = getRoleNameAr(user.role);
    
    return user;
  } catch (error) {
    console.error('❌ Error getting user access by ID:', error);
    return null;
  }
}

/**
 * Get all users with access information
 * @returns {Promise<Array>} Array of user access objects
 */
export async function getAllUsersAccess() {
  try {
    const query = `
      SELECT u.id, u.email, u.role, u.is_approved, u.onboarding_status, u.first_name, u.last_name
      FROM users u ORDER BY u.created_at DESC
    `;
    const result = await executeQuery(query);
    
    if (!result || !Array.isArray(result)) {
      return [];
    }
    
    return result.map(user => ({
      ...user,
      redirect_path: getRedirectPath(user.role, user.is_approved),
      role_name_ar: getRoleNameAr(user.role)
    }));
  } catch (error) {
    console.error('❌ Error getting all users access:', error);
    return [];
  }
}

/**
 * Get users by role
 * @param {string} role - User role
 * @returns {Promise<Array>} Array of users with that role
 */
export async function getUsersByRole(role) {
  try {
    const query = `
      SELECT u.id, u.email, u.role, u.is_approved, u.onboarding_status, u.first_name, u.last_name
      FROM users u WHERE u.role = ? ORDER BY u.created_at DESC
    `;
    const result = await executeQuery(query, [role]);
    
    if (!result || !Array.isArray(result)) {
      return [];
    }
    
    return result.map(user => ({
      ...user,
      redirect_path: getRedirectPath(user.role, user.is_approved),
      role_name_ar: getRoleNameAr(user.role)
    }));
  } catch (error) {
    console.error('❌ Error getting users by role:', error);
    return [];
  }
}

/**
 * Get redirect path based on user role and approval status
 * @param {string} role - User role
 * @param {boolean} isApproved - Whether user is approved
 * @returns {string} Redirect path
 */
function getRedirectPath(role, isApproved) {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'TEACHER':
      return isApproved ? '/dashboard/teacher' : '/auth/awaiting-approval?type=teacher';
    case 'STUDENT':
      return isApproved ? '/dashboard/student' : '/auth/awaiting-approval?type=student';
    case 'ACADEMIC_MOD':
      return '/dashboard/admin';
    default:
      return '/';
  }
}

/**
 * Get Arabic role name
 * @param {string} role - User role
 * @returns {string} Arabic role name
 */
function getRoleNameAr(role) {
  switch (role) {
    case 'ADMIN':
      return 'المدير';
    case 'TEACHER':
      return 'المعلم';
    case 'STUDENT':
      return 'الطالب';
    case 'ACADEMIC_MOD':
      return 'المشرف الأكاديمي';
    default:
      return 'مستخدم';
  }
}
