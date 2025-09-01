const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFooter() {
  try {
    console.log('🧪 TESTING FOOTER COMPONENT...');
    
    // Test if the server is running
    const response = await fetch('http://localhost:3006/');
    
    if (response.ok) {
      const html = await response.text();
      
      // Check if social media links are in the HTML
      if (html.includes('تابعونا عبر الروابط التالية')) {
        console.log('✅ Footer component found in HTML');
        console.log('✅ Social media links are present');
      } else {
        console.log('❌ Footer component not found in HTML');
      }
      
      // Check for specific social media links
      if (html.includes('instagram.com/yaqeen_platform')) {
        console.log('✅ Instagram link found');
      }
      
      if (html.includes('facebook.com/share/17AHX7QsE5')) {
        console.log('✅ Facebook link found');
      }
      
      if (html.includes('t.me/minasat_yaqin')) {
        console.log('✅ Telegram link found');
      }
      
      if (html.includes('whatsapp.com/channel/0029Vb65Dlq1yT2Demx4KN2y')) {
        console.log('✅ WhatsApp link found');
      }
      
      if (html.includes('yaqeenplatform@gmail.com')) {
        console.log('✅ Email found');
      }
      
      if (html.includes('+963 951 736 653')) {
        console.log('✅ Phone number found');
      }
      
    } else {
      console.log('❌ Server not responding');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFooter();
