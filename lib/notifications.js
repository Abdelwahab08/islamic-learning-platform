import { executeQuery } from '@/config/database';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a notification (replaces the notify_scope stored procedure)
 * @param {string} userId - The user ID to notify
 * @param {string} type - The notification type
 * @param {string} message - The notification message
 */
export async function createNotification(userId, type, message) {
  try {
    const query = `
      INSERT INTO notifications (id, user_id, title, body, read_flag, created_at)
      VALUES (?, ?, ?, ?, 0, NOW())
    `;
    
    const notificationId = uuidv4();
    await executeQuery(query, [notificationId, userId, type, message]);
    
    console.log(`✅ Notification created: ${type} for user ${userId}`);
    return notificationId;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
}

/**
 * Create multiple notifications for different users
 * @param {Array} notifications - Array of {userId, type, message} objects
 */
export async function createMultipleNotifications(notifications) {
  try {
    const promises = notifications.map(notification => 
      createNotification(notification.userId, notification.type, notification.message)
    );
    
    await Promise.all(promises);
    console.log(`✅ Created ${notifications.length} notifications`);
  } catch (error) {
    console.error('❌ Error creating multiple notifications:', error);
    throw error;
  }
}

/**
 * Get notifications for a user
 * @param {string} userId - The user ID
 * @param {number} limit - Number of notifications to return (default: 50)
 */
export async function getUserNotifications(userId, limit = 50) {
  try {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    
    const result = await executeQuery(query, [userId, limit]);
    return result || [];
  } catch (error) {
    console.error('❌ Error getting user notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 * @param {string} notificationId - The notification ID
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const query = `
      UPDATE notifications 
      SET read_flag = 1 
      WHERE id = ?
    `;
    
    await executeQuery(query, [notificationId]);
    console.log(`✅ Notification ${notificationId} marked as read`);
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Delete old notifications (cleanup)
 * @param {number} daysOld - Delete notifications older than this many days
 */
export async function cleanupOldNotifications(daysOld = 30) {
  try {
    const query = `
      DELETE FROM notifications 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    const result = await executeQuery(query, [daysOld]);
    console.log(`✅ Cleaned up old notifications`);
    return result;
  } catch (error) {
    console.error('❌ Error cleaning up notifications:', error);
    throw error;
  }
}

/**
 * Notification templates for common scenarios
 */
export const notificationTemplates = {
  TEACHER_ASSIGNED: {
    title: 'تم تعيين معلم جديد',
    body: 'تم تعيين معلم جديد لك. يمكنك الآن التواصل معه.'
  },
  SUBMISSION_RECEIVED: {
    title: 'تم استلام الواجب',
    body: 'تم استلام واجبك بنجاح. سيتم مراجعته قريباً.'
  },
  MESSAGE_RECEIVED: {
    title: 'رسالة جديدة',
    body: 'لديك رسالة جديدة من معلمك.'
  }
};

/**
 * Create notification from template
 * @param {string} userId - The user ID
 * @param {string} templateKey - The template key
 * @param {Object} variables - Variables to replace in template
 */
export async function createNotificationFromTemplate(userId, templateKey, variables = {}) {
  try {
    const template = notificationTemplates[templateKey];
    if (!template) {
      throw new Error(`Template ${templateKey} not found`);
    }
    
    let title = template.title;
    let body = template.body;
    
    // Replace variables in template
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      title = title.replace(regex, variables[key]);
      body = body.replace(regex, variables[key]);
    });
    
    return await createNotification(userId, title, body);
  } catch (error) {
    console.error('❌ Error creating notification from template:', error);
    throw error;
  }
}
