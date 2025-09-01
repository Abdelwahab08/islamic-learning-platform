import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import { ar } from 'date-fns/locale';

export function getCurrentWeek() {
  const now = new Date()
  const startOfWeek = new Date(now)
  const dayOfWeek = now.getDay()
  // In Arabic calendar, Sunday is 0, Monday is 1, etc.
  // We want to start from Sunday (0)
  const diff = now.getDate() - dayOfWeek
  startOfWeek.setDate(diff)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return { start: startOfWeek, end: endOfWeek }
}

export function getPreviousWeek() {
  const currentWeek = getCurrentWeek()
  const start = new Date(currentWeek.start)
  start.setDate(start.getDate() - 7)
  
  const end = new Date(currentWeek.end)
  end.setDate(end.getDate() - 7)
  
  return { start, end }
}

export function getNextWeek() {
  const currentWeek = getCurrentWeek()
  const start = new Date(currentWeek.start)
  start.setDate(start.getDate() + 7)
  
  const end = new Date(currentWeek.end)
  end.setDate(end.getDate() + 7)
  
  return { start, end }
}

export function getWeekDays(startDate: Date, endDate: Date): string[] {
  const days: string[] = []
  const current = new Date(startDate)
  
  // Ensure we get exactly 7 days
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(current)
    dayDate.setDate(current.getDate() + i)
    days.push(formatDateForAPI(dayDate))
  }
  
  return days
}

export function formatWeekDay(date: Date): string {
  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  return weekDays[date.getDay()]
}

export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'short'
  })
}

export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getWeekLabel(date: Date): string {
  const startOfWeek = new Date(date)
  const endOfWeek = new Date(date)
  endOfWeek.setDate(date.getDate() + 6)
  
  const startStr = startOfWeek.toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  
  const endStr = endOfWeek.toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  
  return `${startStr} - ${endStr}`
}
