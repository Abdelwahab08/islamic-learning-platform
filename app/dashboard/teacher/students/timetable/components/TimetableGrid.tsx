'use client'

import { formatWeekDay, formatDateDisplay } from '@/lib/dates'
import { User, Info, Star, CheckCircle, RotateCcw, X, Clock } from 'lucide-react'

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

interface TimetableData {
  days: string[]
  students: Student[]
  entries: { [studentId: string]: { [date: string]: Entry } }
}

interface TimetableGridProps {
  data: TimetableData
  onCellClick: (student: Student, date: string, entry?: Entry) => void
}

export default function TimetableGrid({ data, onCellClick }: TimetableGridProps) {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'متفوق':
      case 'ممتاز':
        return 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg'
      case 'جيد':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
      case 'إعادة':
        return 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg'
      case 'غياب':
        return 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg'
      case 'إذن':
        return 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg'
      default:
        return 'bg-gray-100 hover:bg-gray-200 text-gray-500 border-2 border-dashed border-gray-300'
    }
  }

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'متفوق':
      case 'ممتاز':
        return <Star className="w-4 h-4" />
      case 'جيد':
        return <CheckCircle className="w-4 h-4" />
      case 'إعادة':
        return <RotateCcw className="w-4 h-4" />
      case 'غياب':
        return <X className="w-4 h-4" />
      case 'إذن':
        return <Clock className="w-4 h-4" />
      default:
        return null
    }
  }

  const getRatingText = (rating: string) => {
    switch (rating) {
      case 'متفوق':
      case 'ممتاز':
        return '10'
      case 'جيد':
        return '9'
      case 'إعادة':
        return 'إعادة'
      case 'غياب':
        return 'غياب'
      case 'إذن':
        return 'إذن'
      default:
        return ''
    }
  }

  const getStudentInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase()
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="grid grid-cols-8 gap-1 mb-2">
          {/* Day Headers */}
          {data.days.map((day, index) => {
            const date = new Date(day)
            return (
              <div key={day} className="bg-gray-50 border border-gray-200 p-3 text-center">
                <div className="font-bold text-sm">{formatWeekDay(date)}</div>
                <div className="text-xs text-gray-500">{formatDateDisplay(date)}</div>
              </div>
            )
          })}
          
          {/* Student Name Column Header */}
          <div className="sticky left-0 z-20 bg-white border border-gray-200 p-3 font-bold text-center">
            اسم الطالب
          </div>
        </div>

        {/* Student Rows */}
        {data.students.map((student) => (
          <div key={student.id} className="grid grid-cols-8 gap-1 mb-1">
            {/* Day Cells */}
            {data.days.map((day) => {
              const entry = data.entries[student.id]?.[day]
              const hasNotes = entry?.notes && entry.notes.trim().length > 0
              const isEmpty = !entry
              
              return (
                <div
                  key={`${student.id}-${day}`}
                  className={`
                    border-2 p-3 cursor-pointer hover:shadow-lg transition-all duration-200
                    ${entry ? getRatingColor(entry.rating) : 'bg-gray-100 hover:bg-gray-200 text-gray-500 border-dashed border-gray-300'}
                    ${hasNotes ? 'relative ring-2 ring-blue-300' : ''}
                    ${isEmpty ? 'hover:border-gray-400' : ''}
                    min-h-[80px] flex flex-col justify-center items-center
                  `}
                  onClick={() => onCellClick(student, day, entry)}
                  role="button"
                  tabIndex={0}
                  aria-label={`تقييم ${student.name} في ${formatDateDisplay(new Date(day))}`}
                  title={entry ? `${student.name} - ${entry.rating} - ص ${entry.page_number}${entry.notes ? ` - ${entry.notes}` : ''}` : `${student.name} - لا يوجد تقييم`}
                >
                  {entry ? (
                    // Box with evaluation data
                    <div className="text-center space-y-1">
                      {/* Rating Icon */}
                      <div className="flex justify-center mb-1">
                        {getRatingIcon(entry.rating)}
                      </div>
                      
                      {/* Rating Text (Grade) */}
                      <div className="text-lg font-bold">
                        {getRatingText(entry.rating)}
                      </div>
                      
                      {/* Page Number */}
                      <div className="text-xs opacity-90 font-medium">
                        ص {entry.page_number}
                      </div>
                      
                      {/* Notes indicator */}
                      {hasNotes && (
                        <div className="absolute top-1 right-1">
                          <Info className="w-3 h-3 text-blue-600" />
                        </div>
                      )}
                    </div>
                  ) : (
                    // Empty box
                    <div className="text-center text-gray-400">
                      <div className="text-xs">اضغط لإضافة تقييم</div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Student Name Column */}
            <div className="sticky left-0 z-10 bg-white border border-gray-200 p-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                {getStudentInitials(student.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate" title={student.name}>
                  {student.name}
                </div>
                <div className="text-xs text-gray-500 truncate" title={`${student.current_stage_name} - ص ${student.current_page}`}>
                  {student.current_stage_name} - ص {student.current_page}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
