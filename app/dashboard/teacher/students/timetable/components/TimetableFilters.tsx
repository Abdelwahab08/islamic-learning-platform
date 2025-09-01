'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react'
import { getWeekLabel } from '@/lib/dates'

interface Filters {
  stage_id: string
  group_id: string
}

interface WeekRange {
  start: Date
  end: Date
}

interface TimetableFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  currentWeek: WeekRange
  onWeekChange: (direction: 'prev' | 'next' | 'current') => void
  onRefresh: () => void
}

export default function TimetableFilters({
  filters,
  onFiltersChange,
  currentWeek,
  onWeekChange,
  onRefresh
}: TimetableFiltersProps) {
  const [stages, setStages] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])

  useEffect(() => {
    fetchStages()
    fetchGroups()
  }, [])

  const fetchStages = async () => {
    try {
      const response = await fetch('/api/stages')
      if (response.ok) {
        const data = await response.json()
        setStages(data.stages || [])
      }
    } catch (error) {
      console.error('Error fetching stages:', error)
    }
  }

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/teacher/groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWeekChange('prev')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Badge variant="secondary" className="px-4 py-2">
              {getWeekLabel(currentWeek.start)}
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWeekChange('next')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWeekChange('current')}
            >
              الأسبوع الحالي
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={filters.stage_id}
              onChange={(e) => onFiltersChange({ ...filters, stage_id: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">جميع المستويات</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name_ar}
                </option>
              ))}
            </select>

            <select
              value={filters.group_id}
              onChange={(e) => onFiltersChange({ ...filters, group_id: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">جميع المجموعات</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
