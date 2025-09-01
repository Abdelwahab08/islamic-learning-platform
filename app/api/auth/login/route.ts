import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { getUserAccessByEmail } from '@/lib/user-access-helper';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // Use the helper function instead of direct query
    const user = await getUserAccessByEmail(email) as any;
    
    if (!user) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash as string);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // Check if user is approved
    if (!user.is_approved) {
      return NextResponse.json(
        { 
          error: 'طلبك قيد المراجعة من قبل الإدارة. سيتم إعلامك بالنتيجة قريباً.',
          type: 'pending_approval',
          role: user.role
        },
        { status: 403 }
      );
    }

    // Set authentication cookie
    const response = NextResponse.json({
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        roleNameAr: user.role_name_ar,
        redirectPath: user.redirect_path
      }
    });

    // Set authentication cookie
    const token = generateToken({ userId: user.id, role: user.role, email: user.email });
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
    
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في السيرفر' },
      { status: 500 }
    );
  }
}
