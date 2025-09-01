'use client';

import { useState } from 'react';
import { Calendar, Clock, Users, Video, Plus, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Meeting {
  id: string;
  title: string;
  description: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  meeting_type: 'ONLINE' | 'OFFLINE';
  max_participants: number;
  meeting_link?: string;
  location?: string;
}

interface MeetingSchedulerProps {
  onMeetingCreated: (meeting: Meeting) => void;
  students?: Array<{ id: string; name: string }>;
  stages?: Array<{ id: string; name: string }>;
}

export default function MeetingScheduler({ onMeetingCreated, students = [], stages = [] }: MeetingSchedulerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    duration: 60,
    meeting_type: 'ONLINE' as 'ONLINE' | 'OFFLINE',
    max_participants: 10,
    meeting_link: '',
    location: '',
    target_type: 'STAGE' as 'STAGE' | 'GROUP' | 'INDIVIDUAL',
    target_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        onMeetingCreated(result.meeting);
        setIsCreating(false);
        setFormData({
          title: '',
          description: '',
          scheduled_date: '',
          scheduled_time: '',
          duration: 60,
          meeting_type: 'ONLINE',
          max_participants: 10,
          meeting_link: '',
          location: '',
          target_type: 'STAGE',
          target_id: ''
        });
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('خطأ في إنشاء الاجتماع');
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">جدولة اجتماع جديد</h3>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2"
        >
          {isCreating ? 'إلغاء' : <Plus className="w-4 h-4" />}
          {isCreating ? '' : 'اجتماع جديد'}
        </Button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الاجتماع *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="أدخل عنوان الاجتماع"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الاجتماع *
              </label>
              <Select
                value={formData.meeting_type}
                onValueChange={(value) => handleInputChange('meeting_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONLINE">اجتماع إلكتروني</SelectItem>
                  <SelectItem value="OFFLINE">اجتماع حضوري</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف الاجتماع
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="أدخل وصف الاجتماع"
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التاريخ *
              </label>
              <Input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوقت *
              </label>
              <Input
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => handleInputChange('scheduled_time', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المدة (دقائق) *
              </label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => handleInputChange('duration', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 دقيقة</SelectItem>
                  <SelectItem value="60">ساعة واحدة</SelectItem>
                  <SelectItem value="90">ساعة ونصف</SelectItem>
                  <SelectItem value="120">ساعتان</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meeting Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحد الأقصى للمشاركين
              </label>
              <Input
                type="number"
                value={formData.max_participants}
                onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value))}
                min="1"
                max="50"
              />
            </div>

            {formData.meeting_type === 'ONLINE' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الاجتماع
                </label>
                <Input
                  value={formData.meeting_link}
                  onChange={(e) => handleInputChange('meeting_link', e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مكان الاجتماع
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="أدخل مكان الاجتماع"
                />
              </div>
            )}
          </div>

          {/* Target Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الهدف
              </label>
              <Select
                value={formData.target_type}
                onValueChange={(value) => handleInputChange('target_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAGE">مرحلة</SelectItem>
                  <SelectItem value="GROUP">مجموعة</SelectItem>
                  <SelectItem value="INDIVIDUAL">طالب محدد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الهدف
              </label>
              <Select
                value={formData.target_id}
                onValueChange={(value) => handleInputChange('target_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الهدف" />
                </SelectTrigger>
                <SelectContent>
                  {formData.target_type === 'STAGE' && stages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                  {formData.target_type === 'INDIVIDUAL' && students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreating(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              جدولة الاجتماع
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
