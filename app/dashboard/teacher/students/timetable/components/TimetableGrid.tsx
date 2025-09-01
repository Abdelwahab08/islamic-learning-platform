'use client'

import { formatWeekDay, formatDateDisplay } from '@/lib/dates'
import { User, Info } from 'lucide-react'

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
              
              return (
                <div
                  key={`${student.id}-${day}`}
                  className={`
                    border border-gray-200 p-2 cursor-pointer hover:shadow-md transition-shadow
                    ${entry ? getRatingColor(entry.rating) : 'bg-gray-100 text-gray-500'}
                    ${hasNotes ? 'relative' : ''}
                  `}
                  onClick={() => onCellClick(student, day, entry)}
                  role="button"
                  tabIndex={0}
                                     aria-label={`تقييم ${student.name} في ${formatDateDisplay(new Date(day))}`}
                  title={entry ? `${student.name} - ${entry.rating} - ص ${entry.page_number}${entry.notes ? ` - ${entry.notes}` : ''}` : `${student.name} - لا يوجد تقييم`}
                >
                                     <div className="text-center">
                     <div className="text-lg font-bold">
                       {entry ? getRatingText(entry.rating) : ''}
                     </div>
                    {entry && (
                      <div className="text-xs opacity-80">
                        ص ({entry.page_number})
                      </div>
                    )}
                  </div>
                  
                  {hasNotes && (
                    <div className="absolute top-1 right-1">
                      <Info className="w-3 h-3" />
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
