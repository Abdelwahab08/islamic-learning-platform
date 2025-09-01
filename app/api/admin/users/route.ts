import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate, executeQuerySingle } from '@/config/database'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح لك بالوصول إلى هذه البيانات' },
        { status: 403 }
      )
    }

    const users = await executeQuery(`
      SELECT 
        u.id,
        u.email,
        u.role,
        u.is_approved,
        u.onboarding_status,
        u.created_at,
        CASE 
          WHEN u.role = 'STUDENT' THEN (
            SELECT JSON_OBJECT(
              'id', t.id,
              'name', u2.email,
              'email', u2.email
            )
            FROM teacher_students ts
            JOIN teachers t ON ts.teacher_id = t.id
            JOIN users u2 ON t.user_id = u2.id
            WHERE ts.student_id = s.id
            LIMIT 1
          )
          ELSE NULL
        END as assigned_teacher
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      ORDER BY u.created_at DESC
    `)

    // Transform the data to match the expected interface
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.is_approved ? 'APPROVED' : 
             user.onboarding_status === 'REJECTED' ? 'REJECTED' : 'PENDING',
      created_at: user.created_at,
      last_login: null, // Set to null since column doesn't exist
      profile: {
        first_name: null,
        last_name: null,
        phone: null
      },
      assignedTeacher: user.assigned_teacher ? JSON.parse(user.assigned_teacher) : null
    }))

    return NextResponse.json(transformedUsers)

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في تحميل المستخدمين' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح لك بتعديل المستخدمين' },
        { status: 403 }
      );
    }

    const { userId, action, data } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { message: 'معرف المستخدم والإجراء مطلوبان' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'approve':
        await executeUpdate(
          'UPDATE users SET is_approved = 1, onboarding_status = "ACTIVE" WHERE id = ?',
          [userId]
        );
        break;

      case 'reject':
        await executeUpdate(
          'UPDATE users SET is_approved = 0, onboarding_status = "REJECTED" WHERE id = ?',
          [userId]
        );
        break;

      case 'verify_teacher':
        await executeUpdate(
          'UPDATE teachers SET verified = 1 WHERE user_id = ?',
          [userId]
        );
        break;

      case 'update_stage':
        if (!data.stageId) {
          return NextResponse.json(
            { message: 'معرف المرحلة مطلوب' },
            { status: 400 }
          );
        }
        await executeUpdate(
          'UPDATE students SET current_stage_id = ?, current_page = 1 WHERE user_id = ?',
          [data.stageId, userId]
        );
        break;

      case 'update_profile':
        const { first_name, last_name, email } = data;
        if (!first_name || !last_name || !email) {
          return NextResponse.json(
            { message: 'جميع البيانات مطلوبة' },
            { status: 400 }
          );
        }
        await executeUpdate(
          'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?',
          [first_name, last_name, email, userId]
        );
        break;

      default:
        return NextResponse.json(
          { message: 'إجراء غير معروف' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: 'تم تحديث المستخدم بنجاح'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'حدث خطأ في تحديث المستخدم' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح لك بحذف المستخدمين' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { message: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userToDelete = await executeQuerySingle(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (!userToDelete) {
      return NextResponse.json(
        { message: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // Delete related records first
    if (userToDelete.role === 'TEACHER') {
      await executeUpdate('DELETE FROM teachers WHERE user_id = ?', [userId]);
    } else if (userToDelete.role === 'STUDENT') {
      await executeUpdate('DELETE FROM students WHERE user_id = ?', [userId]);
    }

    // Delete user
    await executeUpdate('DELETE FROM users WHERE id = ?', [userId]);

    return NextResponse.json({
      message: 'تم حذف المستخدم بنجاح'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'حدث خطأ في حذف المستخدم' },
      { status: 500 }
    );
  }
}
