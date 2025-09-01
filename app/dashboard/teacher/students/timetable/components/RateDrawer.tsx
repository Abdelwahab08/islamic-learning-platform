'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet'
import { User, Calendar, BookOpen, CheckCircle, Star, RotateCcw, X, Clock } from 'lucide-react'

interface Student {
  id: string
  name: string
  current_stage_name: string
  current_page: number
  current_stage_id?: string
}

interface Entry {
  rating: string
  page_number: number
  notes?: string
}

interface RateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student
  date: string
  entry?: Entry
  onSubmit: (data: any) => void
}

const ratings = [
  { value: 'متفوق', label: 'متفوق', icon: CheckCircle, color: 'bg-[#16a34a]' },
  { value: 'ممتاز', label: 'ممتاز', icon: Star, color: 'bg-[#16a34a]' },
  { value: 'جيد', label: 'جيد', icon: CheckCircle, color: 'bg-[#22c55e]' },
  { value: 'إعادة', label: 'إعادة', icon: RotateCcw, color: 'bg-[#f59e0b]' },
  { value: 'غياب', label: 'غياب', icon: X, color: 'bg-[#ef4444]' },
  { value: 'إذن', label: 'إذن', icon: Clock, color: 'bg-[#2db1a1]' }
]

const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'متفوق':
    case 'ممتاز':
      return 'bg-[#16a34a] text-white'
    case 'جيد':
      return 'bg-[#22c55e] text-white'
    case 'إعادة':
      return 'bg-[#f59e0b] text-white'
    case 'غياب':
      return 'bg-[#ef4444] text-white'
    case 'إذن':
      return 'bg-[#2db1a1] text-white'
    default:
      return 'bg-gray-100 text-gray-500'
  }
}

export default function RateDrawer({
  open,
  onOpenChange,
  student,
  date,
  entry,
  onSubmit
}: RateDrawerProps) {
  const [formData, setFormData] = useState({
    rating: '',
    page_number: student.current_page,
    notes: ''
  })

  useEffect(() => {
    if (entry) {
      setFormData({
        rating: entry.rating,
        page_number: entry.page_number,
        notes: entry.notes || ''
      })
    } else {
      setFormData({
        rating: '',
        page_number: student.current_page,
        notes: ''
      })
    }
  }, [entry, student.current_page])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.rating) {
      alert('يرجى اختيار التقييم')
      return
    }

    const submitData = {
      student_id: student.id,
      date: date,
      stage_id: student.current_stage_id || '', // Get from student data
      page_number: formData.page_number,
      rating: formData.rating,
      notes: formData.notes
    }

    onSubmit(submitData)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>تسجيل التسميع</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Student Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-semibold text-lg">{student.name}</div>
                <div className="text-sm text-gray-600">
                  {student.current_stage_name} - ص {student.current_page}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div className="text-sm text-gray-600">
                {formatDate(date)}
              </div>
            </div>

            {/* Current Entry Info */}
            {entry && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-2">التقييم الحالي:</div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={getRatingColor(entry.rating)}>
                    {entry.rating}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    الصفحة: {entry.page_number}
                  </span>
                </div>
                {entry.notes && (
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">ملاحظات:</span> {entry.notes}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rating Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                التقييم
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ratings.map((rating) => {
                  const Icon = rating.icon
                  return (
                    <Button
                      key={rating.value}
                      type="button"
                      variant={formData.rating === rating.value ? 'default' : 'outline'}
                      className={`justify-start ${
                        formData.rating === rating.value ? rating.color : ''
                      }`}
                      onClick={() => setFormData({ ...formData, rating: rating.value })}
                    >
                      <Icon className="w-4 h-4 ml-2" />
                      {rating.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Page Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الصفحة
              </label>
              <Input
                type="number"
                min="1"
                value={formData.page_number}
                onChange={(e) => setFormData({ ...formData, page_number: parseInt(e.target.value) || 1 })}
                className="w-full"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أضف ملاحظات حول التقييم..."
                rows={3}
                className="w-full"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                حفظ التقييم
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
