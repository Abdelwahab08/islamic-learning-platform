'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Notification {
  id: string
  title: string
  body: string
  read_flag: boolean
  created_at: string
}

interface NotificationDropdownProps {
  notifications: Notification[]
  onMarkAsRead: (notificationId: string) => void
  onClose: () => void
}

export default function NotificationDropdown({ 
  notifications, 
  onMarkAsRead, 
  onClose 
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      })

      if (response.ok) {
        onMarkAsRead(notificationId)
        toast.success('تم تحديث الإشعار')
      } else {
        toast.error('فشل في تحديث الإشعار')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('حدث خطأ في تحديث الإشعار')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'منذ دقائق'
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`
    } else {
      return date.toLocaleDateString('ar-SA')
    }
  }

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">الإشعارات</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد إشعارات جديدة</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read_flag ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      {!notification.read_flag && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.body}
                    </p>
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="w-3 h-3 ml-1" />
                      {formatDate(notification.created_at)}
                    </div>
                  </div>
                  {!notification.read_flag && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="تحديد كمقروء"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => {
              // Mark all as read
              notifications.forEach(n => {
                if (!n.read_flag) {
                  handleMarkAsRead(n.id)
                }
              })
            }}
            className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            تحديد الكل كمقروء
          </button>
        </div>
      )}
    </div>
  )
}
