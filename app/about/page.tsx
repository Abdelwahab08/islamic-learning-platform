'use client'

import Link from 'next/link'
import { BookOpen, Users, GraduationCap, Star, ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-white hover:text-gray-200 mb-8">
              <ArrowLeft className="w-5 h-5 ml-2" />
              العودة للصفحة الرئيسية
            </Link>
            <h1 className="text-4xl font-bold mb-6">تعرف علينا</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              منصة تعليمية متخصصة في تعليم القرآن الكريم والعلوم الإسلامية
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-6">من نحن</h2>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                منصة التعلم الإسلامي هي منصة تعليمية متخصصة في تعليم القرآن الكريم 
                والعلوم الإسلامية بطريقة حديثة ومتطورة. نهدف إلى تسهيل عملية التعلم 
                وجعلها متاحة للجميع في أي مكان وزمان.
              </p>
              <p>
                تأسست المنصة بهدف توفير بيئة تعليمية آمنة ومتطورة لتعليم القرآن الكريم 
                والعلوم الإسلامية، مع التركيز على الجودة والتميز في التعليم.
              </p>
              <p>
                نعمل مع فريق من المعلمين المؤهلين والمتخصصين في علوم القرآن والحديث 
                والفقه الإسلامي، لضمان تقديم أفضل تجربة تعليمية للطلاب.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center mb-4">
                <BookOpen className="w-8 h-8 text-primary ml-3" />
                <h3 className="text-xl font-bold text-primary">تعليم القرآن</h3>
              </div>
              <p className="text-muted">
                نقدم برامج تعليمية شاملة لتعليم القرآن الكريم بدءاً من التلاوة 
                وصولاً إلى الحفظ والإجازة.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-accent ml-3" />
                <h3 className="text-xl font-bold text-accent">معلمون متخصصون</h3>
              </div>
              <p className="text-muted">
                فريق من المعلمين المؤهلين والمتخصصين في علوم القرآن والحديث 
                والفقه الإسلامي.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <GraduationCap className="w-8 h-8 text-green-600 ml-3" />
                <h3 className="text-xl font-bold text-green-600">شهادات معتمدة</h3>
              </div>
              <p className="text-muted">
                إصدار شهادات معتمدة بعد إتمام المراحل المختلفة من البرنامج التعليمي.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">مميزات المنصة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">تعليم منهجي</h3>
              <p className="text-muted">
                برامج تعليمية منظمة ومتدرجة تتناسب مع جميع المستويات
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">تعليم تفاعلي</h3>
              <p className="text-muted">
                تفاعل مباشر مع المعلمين ومتابعة مستمرة للتقدم
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">جودة عالية</h3>
              <p className="text-muted">
                معايير عالية للجودة في التعليم والمحتوى
              </p>
            </div>
          </div>
        </div>

        {/* Programs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">البرامج التعليمية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card text-center">
              <h3 className="text-lg font-bold text-primary mb-2">الرشيدي</h3>
              <p className="text-muted text-sm">إتقان لغتي (44 صفحة)</p>
            </div>
            <div className="card text-center">
              <h3 className="text-lg font-bold text-primary mb-2">التلاوة</h3>
              <p className="text-muted text-sm">القارئ الماهر (604 صفحة)</p>
            </div>
            <div className="card text-center">
              <h3 className="text-lg font-bold text-primary mb-2">الحفظ</h3>
              <p className="text-muted text-sm">الحفظ عن الغيب (604 صفحة)</p>
            </div>
            <div className="card text-center">
              <h3 className="text-lg font-bold text-primary mb-2">الإجازة</h3>
              <p className="text-muted text-sm">الإجازة (604 صفحة)</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-4">ابدأ رحلة التعلم اليوم</h2>
            <p className="text-muted mb-6">
              انضم إلينا وابدأ رحلة تعلم القرآن الكريم والعلوم الإسلامية
            </p>
            <div className="space-x-4 space-x-reverse">
              <Link href="/auth/register-student" className="btn-primary inline-block">
                سجل كطالب
              </Link>
              <Link href="/auth/apply-teacher" className="btn-outline inline-block">
                كن معلماً
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
