'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import VoiceRecorder from '@/components/VoiceRecorder';
import { Mic, BookOpen, Calendar, User, Play, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_at: string;
  teacher_name: string;
  created_at: string;
  submitted?: boolean;
  submission_id?: string;
  audio_file_path?: string;
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/student/assignments');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('خطأ في تحميل الواجبات');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !audioBlob) {
      toast.error('يرجى تسجيل الصوت أولاً');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('notes', notes);

      const response = await fetch(`/api/assignments/${selectedAssignment.id}/submit`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        setSelectedAssignment(null);
        setAudioBlob(null);
        setNotes('');
        fetchAssignments(); // Refresh assignments
      } else {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('خطأ في تسليم الواجب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'غير محدد';
    
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.submitted) {
      return <Badge className="bg-green-100 text-green-800">تم التسليم</Badge>;
    }
    
    if (!assignment.due_at) {
      return <Badge className="bg-gray-100 text-gray-800">غير محدد</Badge>;
    }
    
    const dueDate = new Date(assignment.due_at);
    if (isNaN(dueDate.getTime())) {
      return <Badge className="bg-gray-100 text-gray-800">غير محدد</Badge>;
    }
    
    const now = new Date();
    
    if (dueDate < now) {
      return <Badge className="bg-red-100 text-red-800">متأخر</Badge>;
    }
    
    return <Badge className="bg-blue-100 text-blue-800">معلق</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">الواجبات</h1>
        <div className="flex items-center gap-2 text-gray-600">
          <BookOpen className="w-5 h-5" />
          <span>إجمالي الواجبات: {assignments.length}</span>
        </div>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد واجبات</h3>
            <p className="text-gray-500">لم يتم تعيين أي واجبات لك بعد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{assignment.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{assignment.teacher_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>تاريخ الاستحقاق: {formatDate(assignment.due_at)}</span>
                      </div>
                    </div>
                    {getStatusBadge(assignment)}
                  </div>
                  {!assignment.submitted && (
                    <Button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4" />
                      تسليم الواجب
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{assignment.description}</p>
                
                {assignment.submitted && assignment.audio_file_path && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">✅ تم التسليم</h4>
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700">يمكن للمعلم الاستماع للتسجيل</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">تسليم الواجب: {selectedAssignment.title}</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAssignment(null);
                    setAudioBlob(null);
                    setNotes('');
                  }}
                >
                  إغلاق
                </Button>
              </div>

              <div className="space-y-6">
                {/* Assignment Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">تفاصيل الواجب:</h3>
                  <p className="text-gray-700">{selectedAssignment.description}</p>
                  <div className="mt-2 text-sm text-gray-600">
                    تاريخ الاستحقاق: {formatDate(selectedAssignment.due_at)}
                  </div>
                </div>

                {/* Voice Recorder */}
                <VoiceRecorder
                  onRecordingComplete={handleRecordingComplete}
                  isSubmitting={isSubmitting}
                />

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أضف أي ملاحظات أو تعليقات..."
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedAssignment(null);
                      setAudioBlob(null);
                      setNotes('');
                    }}
                    disabled={isSubmitting}
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleSubmitAssignment}
                    disabled={!audioBlob || isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? 'جاري التسليم...' : 'تسليم الواجب'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
