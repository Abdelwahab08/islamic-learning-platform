'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Save, 
  Database, 
  Users, 
  Shield,
  Bell,
  Globe,
  Palette,
  Save as SaveIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SystemSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  maxFileSize: number
  allowedFileTypes: string[]
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailNotifications: boolean
  defaultLanguage: string
  theme: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'منصة التعلم الإسلامي',
    siteDescription: 'منصة تعليمية متخصصة في العلوم الإسلامية',
    contactEmail: 'admin@islamic.edu',
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'mp3', 'mp4', 'doc', 'docx'],
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    defaultLanguage: 'ar',
    theme: 'default'
  })

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'appearance'>('general')

  const saveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        toast.success('تم حفظ الإعدادات بنجاح')
      } else {
        toast.error('فشل في حفظ الإعدادات')
      }
    } catch (error) {
      toast.error('فشل في حفظ الإعدادات')
    } finally {
      setLoading(false)
    }
  }

  const toggleMaintenanceMode = () => {
    setSettings(prev => ({
      ...prev,
      maintenanceMode: !prev.maintenanceMode
    }))
  }

  const toggleRegistration = () => {
    setSettings(prev => ({
      ...prev,
      registrationEnabled: !prev.registrationEnabled
    }))
  }

  const toggleEmailNotifications = () => {
    setSettings(prev => ({
      ...prev,
      emailNotifications: !prev.emailNotifications
    }))
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إعدادات النظام</h1>
        <p className="text-gray-600">تكوين إعدادات المنصة والتفضيلات</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`w-full text-right p-3 rounded-lg transition-colors ${
                    activeTab === 'general'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 ml-2" />
                    الإعدادات العامة
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-right p-3 rounded-lg transition-colors ${
                    activeTab === 'security'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 ml-2" />
                    الأمان والحماية
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-right p-3 rounded-lg transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <Bell className="w-4 h-4 ml-2" />
                    الإشعارات
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`w-full text-right p-3 rounded-lg transition-colors ${
                    activeTab === 'appearance'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <Palette className="w-4 h-4 ml-2" />
                    المظهر والتصميم
                  </div>
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 ml-2" />
                  الإعدادات العامة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">اسم الموقع</label>
                    <Input
                      value={settings.siteName}
                      onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      placeholder="اسم الموقع"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">البريد الإلكتروني للتواصل</label>
                    <Input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">وصف الموقع</label>
                  <Textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    placeholder="وصف الموقع"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الحد الأقصى لحجم الملف (ميجابايت)</label>
                    <Input
                      type="number"
                      value={settings.maxFileSize}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">اللغة الافتراضية</label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => setSettings(prev => ({ ...prev, defaultLanguage: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">وضع الصيانة</h3>
                    <p className="text-sm text-gray-600">إيقاف الموقع مؤقتاً للصيانة</p>
                  </div>
                  <Button
                    onClick={toggleMaintenanceMode}
                    variant={settings.maintenanceMode ? 'default' : 'outline'}
                    className={settings.maintenanceMode ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    {settings.maintenanceMode ? 'مفعل' : 'معطل'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">تسجيل المستخدمين الجدد</h3>
                    <p className="text-sm text-gray-600">السماح للمستخدمين الجدد بالتسجيل</p>
                  </div>
                  <Button
                    onClick={toggleRegistration}
                    variant={settings.registrationEnabled ? 'default' : 'outline'}
                  >
                    {settings.registrationEnabled ? 'مفعل' : 'معطل'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 ml-2" />
                  الأمان والحماية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">مدة انتهاء الجلسة (دقائق)</label>
                    <Input type="number" defaultValue={30} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">عدد محاولات تسجيل الدخول</label>
                    <Input type="number" defaultValue={5} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">أنواع الملفات المسموحة</label>
                  <div className="flex flex-wrap gap-2">
                    {settings.allowedFileTypes.map((type, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800">
                        {type.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">إعدادات الأمان المتقدمة</h3>
                  <p className="text-sm text-yellow-700">
                    هذه الإعدادات تؤثر على أمان النظام. يرجى الحذر عند تغييرها.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 ml-2" />
                  الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">إشعارات البريد الإلكتروني</h3>
                    <p className="text-sm text-gray-600">إرسال إشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <Button
                    onClick={toggleEmailNotifications}
                    variant={settings.emailNotifications ? 'default' : 'outline'}
                  >
                    {settings.emailNotifications ? 'مفعل' : 'معطل'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">خادم SMTP</label>
                    <Input placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">منفذ SMTP</label>
                    <Input placeholder="587" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">بريد إلكتروني المرسل</label>
                  <Input type="email" placeholder="noreply@islamic.edu" />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 ml-2" />
                  المظهر والتصميم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">المظهر الافتراضي</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="default">افتراضي</option>
                    <option value="dark">داكن</option>
                    <option value="light">فاتح</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">اللون الأساسي</label>
                    <Input type="color" defaultValue="#1e40af" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">لون الخلفية</label>
                    <Input type="color" defaultValue="#ffffff" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">لون النص</label>
                    <Input type="color" defaultValue="#1f2937" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">شعار الموقع</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Globe className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">اضغط لرفع الشعار</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-6">
            <Button
              onClick={saveSettings}
              disabled={loading}
              className="btn-primary w-full"
            >
              <SaveIcon className="w-4 h-4 ml-2" />
              {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
