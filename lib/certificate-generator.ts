import puppeteer from 'puppeteer'

interface CertificateData {
  studentName: string;
  teacherName: string;
  stageName: string;
  completionDate: string;
  certificateId: string;
  grade?: string;
  serial?: number;
  quranPortion?: string;
}

export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  try {
    console.log('Generating certificate with data:', data);

    // Create HTML certificate with the exact format requested - COMPACT ONE PAGE
    const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>منصة يقين - شهادة إنجاز</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;900&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Cairo', 'Amiri', serif;
            background: #f8f9fa;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .certificate {
            background: white;
            width: 1123px; /* A4 landscape width */
            height: 794px; /* A4 landscape height */
            position: relative;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            border-radius: 20px;
            overflow: hidden;
            border: 3px solid #1e40af;
        }

        /* Islamic geometric border patterns */
        .border-pattern {
            position: absolute;
            width: 40px;
            height: 100%;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 15px,
                #1e40af 15px,
                #1e40af 17px,
                transparent 17px,
                transparent 30px
            );
            z-index: 1;
        }

        .border-pattern.left {
            left: 0;
            background: repeating-linear-gradient(
                90deg,
                transparent,
                transparent 15px,
                #1e40af 15px,
                #1e40af 17px,
                transparent 17px,
                transparent 30px
            );
        }

        .border-pattern.right {
            right: 0;
            background: repeating-linear-gradient(
                -90deg,
                transparent,
                transparent 15px,
                #1e40af 15px,
                #1e40af 17px,
                transparent 17px,
                transparent 30px
            );
        }

        /* Corner decorations - smaller */
        .corner-decoration {
            position: absolute;
            width: 50px;
            height: 50px;
            z-index: 2;
        }

        .corner-tl {
            top: 15px;
            left: 15px;
            background: radial-gradient(circle at 30% 30%, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
            clip-path: polygon(0 0, 100% 0, 0 100%);
        }

        .corner-tr {
            top: 15px;
            right: 15px;
            background: radial-gradient(circle at 70% 30%, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
            clip-path: polygon(100% 0, 100% 100%, 0 0);
        }

        .corner-bl {
            bottom: 15px;
            left: 15px;
            background: radial-gradient(circle at 30% 70%, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
            clip-path: polygon(0 0, 100% 100%, 0 100%);
        }

        .corner-br {
            bottom: 15px;
            right: 15px;
            background: radial-gradient(circle at 70% 70%, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
            clip-path: polygon(100% 0, 100% 100%, 0 100%);
        }

        /* Main content container - more compact */
        .content-container {
            position: relative;
            z-index: 3;
            padding: 30px 60px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        /* Header section - smaller */
        .header {
            text-align: center;
            margin-bottom: 15px;
        }

        .bismillah {
            font-family: 'Amiri', serif;
            font-size: 24px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            letter-spacing: 2px;
        }
        
        .platform-header {
            font-family: 'Amiri', serif;
            font-size: 18px;
            font-weight: bold;
            color: #1a4d1f;
            margin-bottom: 12px;
            text-align: center;
            background: linear-gradient(135deg, #2c5530, #1a4d1f);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .title {
            font-size: 30px;
            font-weight: 900;
            color: #1e40af;
            margin-bottom: 10px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }

        .title-decoration {
            width: 200px;
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, #1e40af 20%, #3b82f6 50%, #1e40af 80%, transparent 100%);
            margin: 0 auto 12px;
            border-radius: 2px;
        }

        /* Main content - compact */
        .main-content {
            text-align: center;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 10px;
        }

        .stage-name {
            font-size: 26px;
            font-weight: 900;
            color: #1e40af;
            margin: 8px 0;
            padding: 12px 25px;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 2px solid #1e40af;
            border-radius: 12px;
            display: inline-block;
            box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
        }

        .status-badge {
            font-size: 20px;
            font-weight: 700;
            color: #059669;
            background: #ecfdf5;
            border: 2px solid #059669;
            padding: 10px 20px;
            border-radius: 10px;
            margin: 10px 0;
            display: inline-block;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 15px 0;
            text-align: right;
        }

        .info-item {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.1);
        }

        .info-label {
            font-size: 14px;
            font-weight: 700;
            color: #475569;
            margin-bottom: 5px;
        }

        .info-value {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            background: rgba(30, 64, 175, 0.1);
            padding: 8px 12px;
            border-radius: 8px;
            border: 2px solid #1e40af;
        }

        .grade-item {
            grid-column: 1 / -1;
            text-align: center;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.1);
        }

        .grade-value {
            font-size: 20px;
            font-weight: 900;
            color: #059669;
            background: #ecfdf5;
            padding: 10px 20px;
            border-radius: 8px;
            border: 2px solid #059669;
        }

        .platform-name {
            font-size: 22px;
            font-weight: 900;
            color: #1e40af;
            margin: 15px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        /* Footer section - compact */
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 25px;
        }

        .signature-section {
            text-align: center;
            flex: 1;
        }

        .signature-line {
            width: 150px;
            height: 2px;
            background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%);
            margin: 10px auto;
            border-radius: 2px;
        }

        .signature-text {
            font-size: 14px;
            color: #475569;
            font-weight: 700;
        }

        .logo-section {
            text-align: center;
            flex: 1;
        }

        .platform-logo {
            width: 150px;
            height: 100px;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            margin: 0 auto 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
            box-shadow: 0 3px 8px rgba(0,0,0,0.1);
        }

        .logo-main-text {
            font-size: 18px;
            font-weight: 900;
            color: #1e293b;
            text-align: center;
            line-height: 1.2;
            margin-bottom: 5px;
            position: relative;
            z-index: 2;
        }

        .logo-minaret {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 25px;
            height: 40px;
            background: #20b2aa;
            border-radius: 5px 5px 0 0;
            z-index: 1;
        }

        .logo-minaret::before {
            content: '';
            position: absolute;
            top: -5px;
            right: 5px;
            width: 15px;
            height: 15px;
            background: white;
            border-radius: 50%;
            border: 1px solid #20b2aa;
        }

        .logo-minaret::after {
            content: '☪';
            position: absolute;
            top: -3px;
            right: 8px;
            font-size: 8px;
            color: #20b2aa;
        }

        .logo-subtitle-bar {
            background: #20b2aa;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            text-align: center;
            margin-top: 5px;
        }

        .date-section {
            text-align: center;
            flex: 1;
        }

        .date-label {
            font-size: 14px;
            color: #475569;
            margin-bottom: 5px;
            font-weight: 600;
        }

        .date-value {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            background: rgba(30, 64, 175, 0.1);
            padding: 8px 15px;
            border-radius: 8px;
            border: 2px solid #1e40af;
        }

        /* Islamic pattern overlay */
        .pattern-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image:
                radial-gradient(circle at 25% 25%, rgba(30, 64, 175, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(30, 64, 175, 0.03) 0%, transparent 50%);
            pointer-events: none;
            z-index: 1;
        }

        /* Logo watermark */
        .logo-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 0;
            pointer-events: none;
            text-align: center;
        }
        
        .watermark-symbol {
            font-size: 120px;
            color: rgba(30, 64, 175, 0.03);
            margin-bottom: 10px;
        }
        
        .watermark-text {
            font-family: 'Amiri', serif;
            font-size: 24px;
            color: rgba(30, 64, 175, 0.04);
            font-weight: bold;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <!-- Border patterns -->
        <div class="border-pattern left"></div>
        <div class="border-pattern right"></div>

        <!-- Corner decorations -->
        <div class="corner-decoration corner-tl"></div>
        <div class="corner-decoration corner-tr"></div>
        <div class="corner-decoration corner-bl"></div>
        <div class="corner-decoration corner-br"></div>

        <!-- Pattern overlay -->
        <div class="pattern-overlay"></div>

        <!-- Logo watermark -->
        <div class="logo-watermark">
            <div class="watermark-symbol">☪</div>
            <div class="watermark-text">منصة يقين</div>
        </div>

        <!-- Main content -->
        <div class="content-container">
            <!-- Header -->
            <div class="header">
                <div class="bismillah">بسم الله الرحمن الرحيم</div>
                <div class="platform-header">منصة يقين</div>
                <h1 class="title">شهادة إنجاز</h1>
                <div class="title-decoration"></div>
            </div>

            <!-- Main content -->
            <div class="main-content">
                <div class="stage-name">${data.stageName}</div>
                <div class="status-badge">معتمدة</div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">المرحلة:</div>
                        <div class="info-value">${data.stageName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">المعلم:</div>
                        <div class="info-value">${data.teacherName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">تاريخ الإصدار:</div>
                        <div class="info-value">${data.completionDate}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">الرقم التسلسلي:</div>
                        <div class="info-value">${data.serial || 'غير محدد'}</div>
                    </div>
                </div>
                
                <div class="grade-item">
                    <div class="info-label">الدرجة:</div>
                    <div class="grade-value">${data.grade || 'غير محدد'}</div>
                </div>
                
                <div class="platform-name">منصة يقين لتعليم القرآن الكريم</div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <div class="signature-section">
                    <div class="signature-line"></div>
                    <div class="signature-text">المدير العام</div>
                </div>

                <div class="logo-section">
                    <div class="platform-logo">
                        <div class="logo-main-text">منصة<br>يقين</div>
                        <div class="logo-minaret"></div>
                        <div class="logo-subtitle-bar">لتعليم القرآن الكريم</div>
                    </div>
                </div>

                <div class="date-section">
                    <div class="date-label">التاريخ</div>
                    <div class="date-value">${data.completionDate}</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })

    try {
      const page = await browser.newPage()

      // Set viewport for A4 landscape
      await page.setViewport({ width: 1123, height: 794 })

      // Set content and wait for fonts to load
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

      // Wait for fonts to load and content to render
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Generate PDF in A4 landscape format
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0'
        },
        preferCSSPageSize: false
      })

      return Buffer.from(pdfBuffer)
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error('Error generating certificate PDF:', error)
    throw error
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
