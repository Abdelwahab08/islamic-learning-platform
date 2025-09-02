export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "ACADEMIC_MOD";

export function redirectFor(role: Role, isApproved: number | boolean) {
  const approved = typeof isApproved === 'boolean' ? (isApproved ? 1 : 0) : Number(isApproved);
  if (role === 'ADMIN' || role === 'ACADEMIC_MOD') return '/dashboard/admin';
  if (role === 'TEACHER') return approved ? '/dashboard/teacher' : '/auth/awaiting-approval?type=teacher';
  if (role === 'STUDENT') return approved ? '/dashboard/student' : '/auth/awaiting-approval?type=student';
  return '/';
}

export function roleNameAr(role: Role) {
  switch (role) {
    case 'ADMIN': return 'المدير';
    case 'TEACHER': return 'المعلم';
    case 'STUDENT': return 'الطالب';
    case 'ACADEMIC_MOD': return 'المشرف الأكاديمي';
    default: return 'مستخدم';
  }
}


