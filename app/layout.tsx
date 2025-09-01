import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import SocialMediaLinks from './components/SocialMediaLinks'

export const metadata: Metadata = {
  title: 'منصه يقين لتعليم القرآن الكريم',
  description: 'منصة تعليمية متخصصة في تعليم القرآن الكريم والعلوم الإسلامية',
  keywords: 'قرآن, تعليم, إسلامي, حفظ, تلاوة, إجازة',
  authors: [{ name: 'منصه يقين لتعليم القرآن الكريم' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-background text-text font-cairo">
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontFamily: 'Cairo, sans-serif',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#2DB1A1',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
