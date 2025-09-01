import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'
import puppeteer from 'puppeteer'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح لك بتحميل التقارير' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const range = searchParams.get('range') || '30'

    // Calculate date range
    const daysAgo = parseInt(range)
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - daysAgo)

    let reportData: any = {}
    let reportTitle = ''

    switch (type) {
      case 'users':
        // Users Report
        const [totalUsers, totalTeachers, totalStudents, newUsers] = await Promise.all([
          executeQuery('SELECT COUNT(*) as count FROM users'),
          executeQuery('SELECT COUNT(*) as count FROM teachers'),
          executeQuery('SELECT COUNT(*) as count FROM students'),
          executeQuery(`
            SELECT 
              DATE_FORMAT(created_at, '%Y-%m-%d') as date,
              COUNT(*) as count
            FROM users 
            WHERE created_at >= ?
            GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
            ORDER BY date DESC
          `, [dateFrom])
        ])

        reportData = {
          totalUsers: totalUsers[0]?.count || 0,
          totalTeachers: totalTeachers[0]?.count || 0,
          totalStudents: totalStudents[0]?.count || 0,
          newUsers: newUsers
        }
        reportTitle = 'تقرير المستخدمين'
        break

      case 'certificates':
        // Certificates Report
        const [totalCertificates, pendingCertificates, approvedCertificates, certificateStats] = await Promise.all([
          executeQuery('SELECT COUNT(*) as count FROM certificates'),
          executeQuery('SELECT COUNT(*) as count FROM certificates WHERE status = ?', ['PENDING']),
          executeQuery('SELECT COUNT(*) as count FROM certificates WHERE status = ?', ['APPROVED']),
          executeQuery(`
            SELECT 
              DATE_FORMAT(issued_at, '%Y-%m-%d') as date,
              COUNT(*) as count
            FROM certificates 
            WHERE issued_at >= ?
            GROUP BY DATE_FORMAT(issued_at, '%Y-%m-%d')
            ORDER BY date DESC
          `, [dateFrom])
        ])

        reportData = {
          totalCertificates: totalCertificates[0]?.count || 0,
          pendingCertificates: pendingCertificates[0]?.count || 0,
          approvedCertificates: approvedCertificates[0]?.count || 0,
          certificateStats: certificateStats
        }
        reportTitle = 'تقرير الشهادات'
        break

             case 'performance':
         // Performance Report
         const [totalAssignments, completedAssignments, totalMaterials, totalMeetings, stageProgress] = await Promise.all([
           executeQuery('SELECT COUNT(*) as count FROM assignments'),
           executeQuery('SELECT COUNT(*) as count FROM submissions'),
           executeQuery('SELECT COUNT(*) as count FROM materials'),
           executeQuery('SELECT COUNT(*) as count FROM meetings'),
           executeQuery(`
             SELECT 
               st.name_ar as stage,
               COUNT(s.id) as students,
               ROUND((COUNT(s.id) / (SELECT COUNT(*) FROM students)) * 100, 1) as completionRate
             FROM stages st
             LEFT JOIN students s ON st.id = COALESCE(s.stage_id, s.current_stage_id)
             GROUP BY st.id, st.name_ar
             ORDER BY st.id
           `)
         ])

         reportData = {
           totalAssignments: totalAssignments[0]?.count || 0,
           completedAssignments: completedAssignments[0]?.count || 0,
           totalMaterials: totalMaterials[0]?.count || 0,
           totalMeetings: totalMeetings[0]?.count || 0,
           stageProgress: stageProgress
         }
         reportTitle = 'تقرير الأداء'
         break

       case 'comprehensive':
         // Comprehensive Report - All data combined
         const [compTotalUsers, compTotalTeachers, compTotalStudents, compNewUsers, 
               compTotalCertificates, compPendingCertificates, compApprovedCertificates, compCertificateStats,
               compTotalAssignments, compCompletedAssignments, compTotalMaterials, compTotalMeetings, compStageProgress] = await Promise.all([
           executeQuery('SELECT COUNT(*) as count FROM users'),
           executeQuery('SELECT COUNT(*) as count FROM teachers'),
           executeQuery('SELECT COUNT(*) as count FROM students'),
           executeQuery(`
             SELECT 
               DATE_FORMAT(created_at, '%Y-%m-%d') as date,
               COUNT(*) as count
             FROM users 
             WHERE created_at >= ?
             GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
             ORDER BY date DESC
           `, [dateFrom]),
           executeQuery('SELECT COUNT(*) as count FROM certificates'),
           executeQuery('SELECT COUNT(*) as count FROM certificates WHERE status = ?', ['PENDING']),
           executeQuery('SELECT COUNT(*) as count FROM certificates WHERE status = ?', ['APPROVED']),
           executeQuery(`
             SELECT 
               DATE_FORMAT(issued_at, '%Y-%m-%d') as date,
               COUNT(*) as count
             FROM certificates 
             WHERE issued_at >= ?
             GROUP BY DATE_FORMAT(issued_at, '%Y-%m-%d')
             ORDER BY date DESC
           `, [dateFrom]),
           executeQuery('SELECT COUNT(*) as count FROM assignments'),
           executeQuery('SELECT COUNT(*) as count FROM submissions'),
           executeQuery('SELECT COUNT(*) as count FROM materials'),
           executeQuery('SELECT COUNT(*) as count FROM meetings'),
           executeQuery(`
             SELECT 
               st.name_ar as stage,
               COUNT(s.id) as students,
               ROUND((COUNT(s.id) / (SELECT COUNT(*) FROM students)) * 100, 1) as completionRate
             FROM stages st
             LEFT JOIN students s ON st.id = COALESCE(s.stage_id, s.current_stage_id)
             GROUP BY st.id, st.name_ar
             ORDER BY st.id
           `)
         ])

         reportData = {
           totalUsers: compTotalUsers[0]?.count || 0,
           totalTeachers: compTotalTeachers[0]?.count || 0,
           totalStudents: compTotalStudents[0]?.count || 0,
           newUsers: compNewUsers,
           totalCertificates: compTotalCertificates[0]?.count || 0,
           pendingCertificates: compPendingCertificates[0]?.count || 0,
           approvedCertificates: compApprovedCertificates[0]?.count || 0,
           certificateStats: compCertificateStats,
           totalAssignments: compTotalAssignments[0]?.count || 0,
           completedAssignments: compCompletedAssignments[0]?.count || 0,
           totalMaterials: compTotalMaterials[0]?.count || 0,
           totalMeetings: compTotalMeetings[0]?.count || 0,
           stageProgress: compStageProgress
         }
         reportTitle = 'التقرير الشامل'
         break

       default:
         return NextResponse.json(
           { message: 'نوع التقرير غير معروف' },
           { status: 400 }
         )
    }

    // Generate HTML report
    const htmlContent = generateHTMLReport(type, reportData, reportTitle, range)

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    try {
      const page = await browser.newPage()
      
      // Set content and wait for fonts to load
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      })
      
      // Return PDF content
      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="report-${type}-${range}days.pdf"`
        }
      })
    } finally {
      await browser.close()
    }

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في إنشاء التقرير' },
      { status: 500 }
    )
  }
}

function generateHTMLReport(type: string, data: any, title: string, range: string): string {
  const date = new Date().toLocaleDateString('ar-SA')
  
  let content = ''
  
  switch (type) {
    case 'users':
      content = `
        <div class="section">
          <h2>إحصائيات المستخدمين</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${data.totalUsers}</div>
              <div class="stat-label">إجمالي المستخدمين</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.totalTeachers}</div>
              <div class="stat-label">إجمالي المعلمين</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.totalStudents}</div>
              <div class="stat-label">إجمالي الطلاب</div>
            </div>
          </div>
          <h3>المستخدمين الجدد (آخر ${range} يوم)</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>التاريخ</th><th>العدد</th></tr>
              </thead>
              <tbody>
                ${data.newUsers.map((user: any) => `<tr><td>${user.date}</td><td>${user.count}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `
      break
      
    case 'certificates':
      content = `
        <div class="section">
          <h2>إحصائيات الشهادات</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${data.totalCertificates}</div>
              <div class="stat-label">إجمالي الشهادات</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.pendingCertificates}</div>
              <div class="stat-label">الشهادات المعلقة</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.approvedCertificates}</div>
              <div class="stat-label">الشهادات المعتمدة</div>
            </div>
          </div>
          <h3>الشهادات الصادرة (آخر ${range} يوم)</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>التاريخ</th><th>العدد</th></tr>
              </thead>
              <tbody>
                ${data.certificateStats.map((cert: any) => `<tr><td>${cert.date}</td><td>${cert.count}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `
      break
      
    case 'performance':
      content = `
        <div class="section">
          <h2>إحصائيات الأداء</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${data.totalAssignments}</div>
              <div class="stat-label">إجمالي الواجبات</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.completedAssignments}</div>
              <div class="stat-label">الواجبات المكتملة</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.totalMaterials}</div>
              <div class="stat-label">المواد التعليمية</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.totalMeetings}</div>
              <div class="stat-label">الاجتماعات</div>
            </div>
          </div>
          <h3>تقدم المراحل الدراسية</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>المرحلة</th><th>عدد الطلاب</th><th>نسبة الإنجاز</th></tr>
              </thead>
              <tbody>
                ${data.stageProgress.map((stage: any) => `<tr><td>${stage.stage}</td><td>${stage.students}</td><td>${stage.completionRate}%</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `
      break

    case 'comprehensive':
      content = `
        <div class="section">
          <h2>التقرير الشامل - إحصائيات المنصة</h2>
          
          <h3>إحصائيات المستخدمين</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${data.totalUsers}</div>
              <div class="stat-label">إجمالي المستخدمين</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.totalTeachers}</div>
              <div class="stat-label">إجمالي المعلمين</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.totalStudents}</div>
              <div class="stat-label">إجمالي الطلاب</div>
            </div>
          </div>
          
          <h3>إحصائيات الشهادات</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${data.totalCertificates}</div>
              <div class="stat-label">إجمالي الشهادات</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.pendingCertificates}</div>
              <div class="stat-label">الشهادات المعلقة</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.approvedCertificates}</div>
              <div class="stat-label">الشهادات المعتمدة</div>
            </div>
          </div>
          
          <h3>إحصائيات الأداء</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${data.totalAssignments}</div>
              <div class="stat-label">إجمالي الواجبات</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.completedAssignments}</div>
              <div class="stat-label">الواجبات المكتملة</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.totalMaterials}</div>
              <div class="stat-label">المواد التعليمية</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.totalMeetings}</div>
              <div class="stat-label">الاجتماعات</div>
            </div>
          </div>
          
          <h3>المستخدمين الجدد (آخر ${range} يوم)</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>التاريخ</th><th>العدد</th></tr>
              </thead>
              <tbody>
                ${data.newUsers.map((user: any) => `<tr><td>${user.date}</td><td>${user.count}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          
          <h3>الشهادات الصادرة (آخر ${range} يوم)</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>التاريخ</th><th>العدد</th></tr>
              </thead>
              <tbody>
                ${data.certificateStats.map((cert: any) => `<tr><td>${cert.date}</td><td>${cert.count}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          
          <h3>تقدم المراحل الدراسية</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>المرحلة</th><th>عدد الطلاب</th><th>نسبة الإنجاز</th></tr>
              </thead>
              <tbody>
                ${data.stageProgress.map((stage: any) => `<tr><td>${stage.stage}</td><td>${stage.students}</td><td>${stage.completionRate}%</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `
      break
  }

  return `
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          
          body {
              font-family: 'Cairo', sans-serif;
              margin: 0;
              padding: 20px;
              background: #f8f9fa;
              color: #333;
          }
          
          .container {
              background: white;
              padding: 40px;
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              max-width: 900px;
              margin: 0 auto;
          }
          
          .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #20B2AA;
              padding-bottom: 30px;
              position: relative;
          }
          
          .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 100px;
              height: 4px;
              background: linear-gradient(90deg, #20B2AA, #48D1CC);
              border-radius: 2px;
          }
          
          .logo-section {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
          }
          
          .logo {
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #20B2AA 0%, #48D1CC 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
              font-weight: bold;
              margin-left: 15px;
          }
          
          .platform-name {
              font-size: 24px;
              font-weight: 700;
              color: #20B2AA;
          }
          
          h1 {
              color: #2c3e50;
              margin: 20px 0 10px 0;
              font-size: 28px;
          }
          
          .report-info {
              display: flex;
              justify-content: space-between;
              margin: 20px 0;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 10px;
              border: 1px solid #e9ecef;
          }
          
          .section {
              margin: 30px 0;
          }
          
          h2 {
              color: #34495e;
              margin: 30px 0 20px 0;
              font-size: 22px;
              border-right: 4px solid #20B2AA;
              padding-right: 15px;
          }
          
          h3 {
              color: #7f8c8d;
              margin: 25px 0 15px 0;
              font-size: 18px;
          }
          
          .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin: 20px 0;
          }
          
          .stat-card {
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              border: 2px solid #20B2AA;
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          
          .stat-number {
              font-size: 32px;
              font-weight: 700;
              color: #20B2AA;
              margin-bottom: 8px;
          }
          
          .stat-label {
              font-size: 14px;
              color: #666;
              font-weight: 600;
          }
          
          .table-container {
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              margin: 20px 0;
          }
          
          table {
              width: 100%;
              border-collapse: collapse;
          }
          
          th, td {
              padding: 15px;
              text-align: right;
              border-bottom: 1px solid #e9ecef;
          }
          
          th {
              background: linear-gradient(135deg, #20B2AA 0%, #48D1CC 100%);
              color: white;
              font-weight: 600;
              font-size: 14px;
          }
          
          tr:nth-child(even) {
              background-color: #f8f9fa;
          }
          
          tr:hover {
              background-color: #e9ecef;
          }
          
          .footer {
              margin-top: 50px;
              text-align: center;
              color: #7f8c8d;
              font-size: 14px;
              border-top: 2px solid #e9ecef;
              padding-top: 30px;
          }
          
          .footer-logo {
              display: inline-flex;
              align-items: center;
              margin-bottom: 10px;
          }
          
          .footer-logo .logo {
              width: 30px;
              height: 30px;
              font-size: 16px;
              margin-left: 8px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <div class="logo-section">
                  <div class="logo">ي</div>
                  <div class="platform-name">منصه يقين لتعليم القرآن الكريم</div>
              </div>
              <h1>${title}</h1>
              <div class="report-info">
                  <div><strong>تاريخ التقرير:</strong> ${date}</div>
                  <div><strong>الفترة:</strong> آخر ${range} يوم</div>
              </div>
          </div>
          
          ${content}
          
          <div class="footer">
              <div class="footer-logo">
                  <div class="logo">ي</div>
                  <span>تم إنشاء هذا التقرير بواسطة منصه يقين لتعليم القرآن الكريم</span>
              </div>
              <p>Yaqeen Platform for Teaching the Holy Quran</p>
          </div>
      </div>
  </body>
  </html>
  `
}
