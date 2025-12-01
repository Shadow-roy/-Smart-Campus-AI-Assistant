

import { useContext, useEffect } from 'react';
import { UserContext } from '../App';
import { NotificationContext } from '../contexts/NotificationContext';
import { parseTime } from '../utils/time';
import { type AppNotification } from '../types';

// A Set to keep track of notifications shown in the current session
// to avoid repeated checks against localStorage.
const sessionNotifiedIds = new Set<string>();

export const useNotificationScheduler = () => {
  const userContext = useContext(UserContext);
  const notificationContext = useContext(NotificationContext);

  useEffect(() => {
    if (!userContext || !notificationContext) return;

    const { assignments, timetableData } = userContext;
    const { addNotification } = notificationContext;

    const checkNotifications = () => {
      const now = new Date();

      /**
       * Dispatches a notification to the in-app center.
       */
      const dispatchNotification = (notificationPayload: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
          addNotification(notificationPayload);
      };


      // 1. Check for upcoming classes
      const todayStr = now.toLocaleDateString('en-US', { weekday: 'long' });
      const todaysClasses = timetableData.find(d => d.day.toLowerCase() === todayStr.toLowerCase())?.classes || [];
      
      for (const cls of todaysClasses) {
        const [startTime] = parseTime(cls.time);
        if (startTime) {
          const diffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
          if (diffMinutes > 0 && diffMinutes <= 15) {
            const notificationId = `class-${cls.code}-${now.toISOString().split('T')[0]}`;
            if (!sessionNotifiedIds.has(notificationId)) {
                dispatchNotification({
                    title: 'Upcoming Class',
                    message: `${cls.subject} is starting in ${Math.round(diffMinutes)} minutes at ${cls.location}.`,
                    type: 'class'
                });
                sessionNotifiedIds.add(notificationId);
            }
          }
        }
      }

      // 2. Check for assignments due soon
      for (const assignment of assignments) {
        if (assignment.status === 'Pending') {
          const dueDate = new Date(assignment.dueDate);
          const today = new Date();
          // Normalize dates for comparison to avoid time zone issues
          dueDate.setHours(0,0,0,0);
          today.setHours(0,0,0,0);
          
          const diffTime = dueDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0 || diffDays === 1) { // Due today or tomorrow
            const notificationId = `assignment-${assignment.id}-${assignment.dueDate}`;
            if (!sessionNotifiedIds.has(notificationId)) {
                dispatchNotification({
                    title: 'Assignment Due Soon',
                    message: `${assignment.title} is due ${diffDays === 0 ? 'today' : 'tomorrow'}.`,
                    type: 'assignment'
                });
                sessionNotifiedIds.add(notificationId);
            }
          }
        }
      }
    };

    const intervalId = setInterval(checkNotifications, 60000); // Check every minute
    checkNotifications(); // Check once on load

    return () => clearInterval(intervalId);

  }, [userContext, notificationContext]);
};