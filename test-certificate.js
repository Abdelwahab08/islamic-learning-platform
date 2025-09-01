const { generateCertificatePDF } = require('./lib/certificate-generator.ts');

async function testCertificate() {
  try {
    const testData = {
      studentName: "أحمد محمد",
      teacherName: "معلم القرآن",
      stageName: "القارئ الماهر (التلاوة)",
      completionDate: "٧ رجب ١٤٤٧ هـ",
      certificateId: "CERT-001",
      quranPortion: "جزء من القرآن الكريم"
    };

    console.log('Testing certificate generation with data:', testData);
    
    const pdfBuffer = await generateCertificatePDF(testData);
    
    console.log('Certificate generated successfully!');
    console.log('PDF size:', pdfBuffer.length, 'bytes');
    
    // Save the PDF for inspection
    const fs = require('fs');
    fs.writeFileSync('test-certificate.pdf', pdfBuffer);
    console.log('Test certificate saved as test-certificate.pdf');
    
  } catch (error) {
    console.error('Error testing certificate:', error);
  }
}

testCertificate();
