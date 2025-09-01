import { v4 as uuidv4 } from 'uuid'
import { executeUpdate } from '@/lib/db'

export interface CreateNotificationParams {
  userId: string
  title: string
  body: string
}

export async function createNotification({ userId, title, body }: CreateNotificationParams) {
  try {
    const notificationId = uuidv4()
    
    await executeUpdate(`
      INSERT INTO notifications (id, user_id, title, body, read_flag, created_at)
      VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `, [notificationId, userId, title, body])
    
    return notificationId
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

// Predefined notification templates
export const notificationTemplates = {
           // Student notifications
         student: {
           welcome: (studentName: string) => ({
             title: 'مرحباً بك في منصة يقين',
             body: `مرحباً ${studentName}! نحن سعداء بانضمامك إلى منصة تعليم القرآن الكريم. نتمنى لك رحلة تعليمية ممتعة ومفيدة.`
           }),
           newAssignment: (assignmentTitle: string) => ({
             title: 'واجب جديد متاح',
             body: `تم إضافة واجب جديد: "${assignmentTitle}". يرجى مراجعة الواجبات وإكمالها في الوقت المحدد.`
           }),
           assignmentGraded: (assignmentTitle: string, grade: string) => ({
             title: 'تم تقييم الواجب',
             body: `تم تقييم واجبك "${assignmentTitle}" بدرجة: ${grade}. يمكنك مراجعة التقييم في صفحة الواجبات.`
           }),
           newCertificate: (stageName: string) => ({
             title: 'شهادة جديدة',
             body: `مبروك! تم إصدار شهادة جديدة لك بعد إكمال مرحلة "${stageName}" بنجاح. يمكنك تحميلها من صفحة الشهادات.`
           }),
           meetingScheduled: (meetingTitle: string, date: string) => ({
             title: 'اجتماع جديد مجدول',
             body: `تم جدولة اجتماع "${meetingTitle}" في ${date}. يرجى التأكد من الحضور.`
           }),
           newMaterial: (materialTitle: string) => ({
             title: 'مادة تعليمية جديدة',
             body: `تم إضافة مادة تعليمية جديدة: "${materialTitle}". يرجى مراجعتها في صفحة المواد التعليمية.`
           }),
           newMessage: (teacherEmail: string, messagePreview: string) => ({
             title: 'رسالة جديدة من المعلم',
             body: `أرسل لك المعلم ${teacherEmail} رسالة جديدة: "${messagePreview}...". يمكنك الرد عليها من صفحة الشات.`
           })
         },
  
           // Teacher notifications
         teacher: {
           welcome: (teacherName: string) => ({
             title: 'مرحباً بك في منصة يقين',
             body: `مرحباً ${teacherName}! نحن سعداء بانضمامك إلى منصة تعليم القرآن الكريم كمعلم. نتمنى لك رحلة تعليمية ناجحة.`
           }),
           newStudent: (studentName: string) => ({
             title: 'طالب جديد مسند',
             body: `تم إسناد الطالب ${studentName} إليك. يمكنك مراجعة بياناته في صفحة عرض الطلاب.`
           }),
           assignmentSubmitted: (studentName: string, assignmentTitle: string) => ({
             title: 'تسليم واجب جديد',
             body: `قام الطالب ${studentName} بتسليم واجب "${assignmentTitle}". يرجى مراجعته وتقييمه.`
           }),
           complaintReceived: (studentName: string, complaintSubject: string) => ({
             title: 'شكوى جديدة',
             body: `تم استلام شكوى من الطالب ${studentName} بخصوص: "${complaintSubject}". يرجى مراجعتها والرد عليها.`
           }),
           certificateRequest: (studentName: string, stageName: string) => ({
             title: 'طلب شهادة جديد',
             body: `طلب الطالب ${studentName} شهادة لمرحلة "${stageName}". يرجى مراجعة الطلب والموافقة عليه.`
           }),
                       newMessage: (studentEmail: string, messagePreview: string) => ({
              title: 'رسالة جديدة من الطالب',
              body: `أرسل لك الطالب ${studentEmail} رسالة جديدة: "${messagePreview}...". يمكنك الرد عليها من صفحة الشات.`
            }),
            voiceSubmission: (studentEmail: string, message: string) => ({
              title: 'تسجيل صوتي جديد من الطالب',
              body: `أرسل لك الطالب ${studentEmail} تسجيل صوتي جديد: "${message}". يمكنك الاستماع إليه وتقييمه.`
            })
         },
  
  // Admin notifications
  admin: {
    newUserRegistration: (userEmail: string, role: string) => ({
      title: 'تسجيل مستخدم جديد',
      body: `تم تسجيل مستخدم جديد: ${userEmail} بدور ${role}. يرجى مراجعة الطلب والموافقة عليه.`
    }),
    certificateApproval: (studentName: string, stageName: string) => ({
      title: 'طلب موافقة على شهادة',
      body: `طلب المعلم إصدار شهادة للطالب ${studentName} لمرحلة "${stageName}". يرجى مراجعة الطلب والموافقة عليه.`
    }),
    systemUpdate: (updateDetails: string) => ({
      title: 'تحديث النظام',
      body: `تم تحديث النظام: ${updateDetails}. يرجى مراجعة التحديثات في صفحة الإعدادات.`
    }),
    newComplaint: (userEmail: string, complaintSubject: string) => ({
      title: 'شكوى جديدة',
      body: `تم استلام شكوى من ${userEmail} بخصوص: "${complaintSubject}". يرجى مراجعتها والرد عليها.`
    })
  }
}

// Helper function to create notifications using templates
export async function createNotificationFromTemplate(
  userId: string, 
  template: { title: string; body: string }
) {
  return createNotification({
    userId,
    title: template.title,
    body: template.body
  })
}

// Bulk notification creation for multiple users
export async function createBulkNotifications(
  userIds: string[], 
  title: string, 
  body: string
) {
  const promises = userIds.map(userId => 
    createNotification({ userId, title, body })
  )
  
  try {
    await Promise.all(promises)
    return true
  } catch (error) {
    console.error('Error creating bulk notifications:', error)
    throw error
  }
}
