'use client'

import { Facebook, Instagram, MessageCircle, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-600 to-green-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">تابعونا عبر الروابط التالية</h3>
          <p className="text-green-100">تواصل معنا عبر وسائل التواصل الاجتماعي</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Instagram */}
          <a 
            href="https://www.instagram.com/yaqeen_platform?igsh=MTlpN2R0MjdqcXI2dw" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            <Instagram className="w-6 h-6 ml-3" />
            <span className="font-semibold">انستغرام</span>
          </a>

          {/* Facebook */}
          <a 
            href="https://www.facebook.com/share/17AHX7QsE5/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
          >
            <Facebook className="w-6 h-6 ml-3" />
            <span className="font-semibold">الفيسبوك</span>
          </a>

          {/* Telegram */}
          <a 
            href="https://t.me/minasat_yaqin" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            <MessageCircle className="w-6 h-6 ml-3" />
            <span className="font-semibold">التلجرام</span>
          </a>

          {/* WhatsApp */}
          <a 
            href="https://whatsapp.com/channel/0029Vb65Dlq1yT2Demx4KN2y" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
          >
            <MessageCircle className="w-6 h-6 ml-3" />
            <span className="font-semibold">قناة الواتساب</span>
          </a>
        </div>

        {/* Contact Information */}
        <div className="text-center border-t border-green-500 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a 
              href="mailto:yaqeenplatform@gmail.com"
              className="flex items-center text-green-100 hover:text-white transition-colors duration-300"
            >
              <Mail className="w-5 h-5 ml-2" />
              <span>yaqeenplatform@gmail.com</span>
            </a>
            
            <a 
              href="tel:+963951736653"
              className="flex items-center text-green-100 hover:text-white transition-colors duration-300"
            >
              <Phone className="w-5 h-5 ml-2" />
              <span>+963 951 736 653</span>
            </a>
          </div>
          
          <div className="mt-4 text-green-100">
            <p>© 2024 منصة يقين لتعليم القرآن الكريم. جميع الحقوق محفوظة</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
