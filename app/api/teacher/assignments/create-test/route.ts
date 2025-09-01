import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id

    // Get teacher record
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
    if (teachers.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
    }
    const teacherRecordId = teachers[0].id

    // Get stage IDs
    const stages = await executeQuery('SELECT id FROM stages LIMIT 3')
    if (stages.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على مراحل' }, { status: 404 })
    }

    // Test assignments data
    const testAssignments = [
      {
        title: 'واجب حفظ سورة الفاتحة',
        description: 'حفظ سورة الفاتحة مع التجويد الصحيح والتطبيق العملي',
        due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        stage_id: stages[0].id
      },
      {
        title: 'واجب قراءة سورة البقرة',
        description: 'قراءة الآيات من 1 إلى 50 من سورة البقرة مع فهم المعنى',
        due_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        stage_id: stages[Math.min(1, stages.length - 1)].id
      },
      {
        title: 'واجب التجويد العملي',
        description: 'تطبيق قواعد التجويد على النصوص المحددة مع التسجيل الصوتي',
        due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        stage_id: stages[Math.min(2, stages.length - 1)].id
      },
      {
        title: 'واجب تفسير القرآن',
        description: 'كتابة تفسير مبسط لآية من القرآن الكريم مع الاستشهاد بالمصادر',
        due_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        stage_id: stages[0].id
      },
      {
        title: 'واجب حفظ الأحاديث النبوية',
        description: 'حفظ 5 أحاديث نبوية شريفة مع شرح معانيها',
        due_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        stage_id: stages[Math.min(1, stages.length - 1)].id
      }
    ]

    const createdAssignments = []

    for (const assignment of testAssignments) {
      try {
        // Create assignment with UUID
        const assignmentId = uuidv4()
        const result = await executeQuery(
          'INSERT INTO assignments (id, title, description, due_at, stage_id, teacher_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [assignmentId, assignment.title, assignment.description, assignment.due_at, assignment.stage_id, teacherRecordId]
        )
        
        // assignmentId is already generated above
        createdAssignments.push({ id: assignmentId, title: assignment.title })

        // Get students assigned to this teacher
        const students = await executeQuery(`
          SELECT s.id FROM students s 
          JOIN teacher_students ts ON s.id = ts.student_id 
          WHERE ts.teacher_id = ? 
          LIMIT 5
        `, [teacherRecordId])

        if (students.length > 0) {
          // Assign students to this assignment
          for (const student of students) {
            try {
              await executeQuery(
                'INSERT INTO assignment_targets (assignment_id, student_id) VALUES (?, ?)',
                [assignmentId, student.id]
              )
            } catch (error) {
              console.error('Error assigning student to assignment:', error)
              // Continue with next student
            }
          }

          // Create test submissions for each assignment with different scenarios
          const submissionScenarios = [
            {
              content: 'تم حفظ سورة الفاتحة بشكل ممتاز مع التجويد الصحيح',
              audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Sample audio URL
              page_number: 1,
              evaluation_grade: null, // Not graded yet
              grade: null
            },
            {
              content: 'حفظ جيد ولكن يحتاج تحسين في التجويد',
              audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
              page_number: 2,
              evaluation_grade: null,
              grade: null
            },
            {
              content: 'تسليم متأخر - يحتاج إعادة',
              audio_url: null,
              page_number: 3,
              evaluation_grade: null,
              grade: null
            },
            {
              content: 'أداء ممتاز في الحفظ والتجويد',
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

          // Create submissions for each student
          for (let i = 0; i < Math.min(students.length, submissionScenarios.length); i++) {
            const student = students[i]
            const scenario = submissionScenarios[i]
            
            try {
              // Try with new schema first
              await executeQuery(
                'INSERT INTO submissions (assignment_id, student_id, content, submitted_at, audio_url, page_number, evaluation_grade, grade) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)',
                [
                  assignmentId, 
                  student.id, 
                  scenario.content,
                  scenario.audio_url,
                  scenario.page_number,
                  scenario.evaluation_grade,
                  scenario.grade
                ]
              )
            } catch (error) {
              console.error('Error creating submission with new schema, trying old schema:', error)
              
              // Fallback to old schema if new columns don't exist
              try {
                await executeQuery(
                  'INSERT INTO submissions (assignment_id, student_id, file_url, submitted_at, grade) VALUES (?, ?, ?, NOW(), ?)',
                  [
                    assignmentId, 
                    student.id, 
                    scenario.content,
                    scenario.grade
                  ]
                )
              } catch (fallbackError) {
                console.error('Error creating submission with old schema:', fallbackError)
                // Continue with next student
              }
            }
          }

          // Create some pre-graded submissions for demonstration
          if (assignment.title.includes('الفاتحة')) {
            // Add some graded submissions to show the system working
            const gradedSubmissions = [
              {
                student_id: students[0].id,
                content: 'حفظ ممتاز - متفوق في الأداء',
                audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
                page_number: 1,
                evaluation_grade: 'متفوق',
                grade: 95
              },
              {
                student_id: students[1]?.id || students[0].id,
                content: 'أداء جيد - يحتاج تحسين',
                audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
                page_number: 2,
                evaluation_grade: 'جيد',
                grade: 75
              }
            ]

            for (const graded of gradedSubmissions) {
              try {
                // Try with new schema first
                await executeQuery(
                  'INSERT INTO submissions (assignment_id, student_id, content, submitted_at, audio_url, page_number, evaluation_grade, grade) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)',
                  [
                    assignmentId,
                    graded.student_id,
                    graded.content,
                    graded.audio_url,
                    graded.page_number,
                    graded.evaluation_grade,
                    graded.grade
                  ]
                )
              } catch (error) {
                console.error('Error creating graded submission with new schema, trying old schema:', error)
                
                // Fallback to old schema
                try {
                  await executeQuery(
                    'INSERT INTO submissions (assignment_id, student_id, file_url, submitted_at, grade) VALUES (?, ?, ?, NOW(), ?)',
                    [
                      assignmentId,
                      graded.student_id,
                      graded.content,
                      graded.grade
                    ]
                  )
                } catch (fallbackError) {
                  console.error('Error creating graded submission with old schema:', fallbackError)
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error creating assignment:', error)
        // Continue with next assignment
      }
    }

    if (createdAssignments.length === 0) {
      return NextResponse.json({ 
        error: 'فشل في إنشاء أي واجبات. يرجى التحقق من قاعدة البيانات.' 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: `تم إنشاء ${createdAssignments.length} واجبات تجريبية بنجاح مع تسليمات متنوعة`,
      assignments: createdAssignments,
      total: createdAssignments.length
    })

  } catch (error) {
    console.error('Error creating test assignments:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء الواجبات التجريبية: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
