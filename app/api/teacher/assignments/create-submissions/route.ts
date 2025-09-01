import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id
    const body = await request.json()
    const assignmentId = body.assignment_id

    // Get teacher record
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
    if (teachers.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
    }
    const teacherRecordId = teachers[0].id

    // Verify teacher owns this assignment
    const ownershipQuery = `
      SELECT id FROM assignments a
      JOIN teachers t ON a.teacher_id = t.id
      WHERE t.user_id = ? AND a.id = ?
    `
    const ownership = await executeQuery(ownershipQuery, [teacherId, assignmentId])
    
    if (ownership.length === 0) {
      return NextResponse.json({ error: 'الواجب غير موجود' }, { status: 404 })
    }

    // Get students assigned to this teacher
    const students = await executeQuery(`
      SELECT s.id FROM students s 
      JOIN teacher_students ts ON s.id = ts.student_id 
      WHERE ts.teacher_id = ? 
      LIMIT 5
    `, [teacherRecordId])

    if (students.length === 0) {
      return NextResponse.json({ error: 'لا يوجد طلاب مسجلين لهذا المدرس' }, { status: 404 })
    }

    // Create diverse test submissions
    const submissionScenarios = [
      {
        content: 'تم حفظ الدرس بشكل ممتاز مع التجويد الصحيح والتطبيق العملي',
        audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        page_number: 1,
        evaluation_grade: null,
        grade: null
      },
      {
        content: 'حفظ جيد ولكن يحتاج تحسين في قواعد التجويد والنطق',
        audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        page_number: 2,
        evaluation_grade: null,
        grade: null
      },
      {
        content: 'تسليم متأخر - يحتاج إعادة وتدريب إضافي',
        audio_url: null,
        page_number: 3,
        evaluation_grade: null,
        grade: null
      },
      {
        content: 'أداء ممتاز في الحفظ والتجويد والاستيعاب',
        audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        page_number: 4,
        evaluation_grade: null,
        grade: null
      },
      {
        content: 'غياب عن الدرس - لم يتم التسليم',
        audio_url: null,
        page_number: 5,
        evaluation_grade: null,
        grade: null
      }
    ]

    const createdSubmissions = []

    // Create submissions for each student
    for (let i = 0; i < Math.min(students.length, submissionScenarios.length); i++) {
      const student = students[i]
      const scenario = submissionScenarios[i]
      
      try {
        // Try with new schema first
        const result = await executeQuery(
          'INSERT INTO submissions (assignment_id, student_id, content, submitted_at, audio_url, page_number, evaluation_grade, grade) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)',
          [
            assignmentId, 
            student.id, 
            scenario.content || null,
            scenario.audio_url || null,
            scenario.page_number || null,
            scenario.evaluation_grade || null,
            scenario.grade || null
          ]
        )

        createdSubmissions.push({
          id: (result as any).insertId,
          student_id: student.id,
          content: scenario.content,
          has_audio: !!scenario.audio_url,
          page_number: scenario.page_number
        })
      } catch (error) {
        console.error('Error creating submission with new schema, trying old schema:', error)
        
        // Fallback to old schema if new columns don't exist
        try {
          const result = await executeQuery(
            'INSERT INTO submissions (assignment_id, student_id, file_url, submitted_at, grade) VALUES (?, ?, ?, NOW(), ?)',
            [
              assignmentId, 
              student.id, 
              scenario.content || 'تسليم تجريبي',
              scenario.grade || null
            ]
          )

          createdSubmissions.push({
            id: (result as any).insertId,
            student_id: student.id,
            content: scenario.content || 'تسليم تجريبي',
            has_audio: false,
            page_number: null
          })
        } catch (fallbackError) {
          console.error('Error creating submission with old schema:', fallbackError)
          // Continue with next student
        }
      }
    }

    if (createdSubmissions.length === 0) {
      return NextResponse.json({ 
        error: 'فشل في إنشاء أي تسليمات. يرجى التحقق من قاعدة البيانات.' 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: `تم إنشاء ${createdSubmissions.length} تسليمات تجريبية بنجاح`,
      submissions: createdSubmissions,
      total: createdSubmissions.length
    })

  } catch (error) {
    console.error('Error creating test submissions:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء التسليمات التجريبية: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
