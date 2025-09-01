const { generateCertificatePDF } = require('./lib/certificate-generator');

async function testCertificateGeneration() {
  try {
    console.log('Testing certificate generation...');
    
    // Test data that should work
    const testData = {
      studentName: "فاطمة علي",
      teacherName: "teacher@islamic.edu",
      stageName: "القارئ الماهر (التلاوة)",
      completionDate: "٣٠ أغسطس ٢٠٢٥",
      certificateId: "test-id",
      grade: "جيد جداً",
      serial: 3
    };
    
    console.log('Test data:', testData);
    
    // Try to generate PDF
    const pdfBuffer = await generateCertificatePDF(testData);
    
    console.log('✅ Certificate generated successfully!');
    console.log('PDF size:', pdfBuffer.length, 'bytes');
    
    // Save to file for testing
    const fs = require('fs');
    fs.writeFileSync('test-certificate.pdf', pdfBuffer);
    console.log('✅ Test certificate saved as test-certificate.pdf');
    
  } catch (error) {
    console.error('❌ Error generating certificate:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testCertificateGeneration();
