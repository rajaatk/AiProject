import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '../services/notificationService';
import { GiftCard } from '../types/GiftCard';

export const useNotifications = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    initializeNotifications();
    setupListeners();
  }, []);

  const initializeNotifications = async () => {
    try {
      const permission = await NotificationService.checkPermissions();
      setHasPermission(permission);
      
      if (permission) {
        await updateScheduledCount();
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const setupListeners = () => {
    NotificationService.setupNotificationListeners();
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await NotificationService.requestPermissions();
      setHasPermission(granted);
      
      if (granted) {
        await updateScheduledCount();
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const scheduleNotificationsForCard = async (giftCard: GiftCard): Promise<void> => {
    try {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      await NotificationService.scheduleAllNotificationsForGiftCard(giftCard);
      await updateScheduledCount();
    } catch (error) {
      console.error('Error scheduling notifications for card:', error);
    }
  };

  const cancelNotificationsForCard = async (giftCardId: string): Promise<void> => {
    try {
      await NotificationService.cancelNotificationsForGiftCard(giftCardId);
      await updateScheduledCount();
    } catch (error) {
      console.error('Error canceling notifications for card:', error);
    }
  };

  const refreshAllNotifications = async (): Promise<void> => {
    try {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      await NotificationService.refreshAllNotifications();
      await updateScheduledCount();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const updateScheduledCount = async (): Promise<void> => {
    try {
      const scheduled = await NotificationService.getScheduledNotifications();
      const giftCardNotifications = scheduled.filter(notification =>
        notification.identifier.startsWith('giftcard_')
      );
      setScheduledCount(giftCardNotifications.length);
    } catch (error) {
      console.error('Error updating scheduled count:', error);
    }
  };

  const checkExpiringCards = async (): Promise<void> => {
    try {
      await NotificationService.checkForExpiringCards();
    } catch (error) {
      console.error('Error checking expiring cards:', error);
    }
  };

  const sendTestNotification = async (): Promise<void> => {
    try {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      await NotificationService.sendImmediateNotification(
        'Test Notification',
        'This is a test notification from Gift Card Scanner!'
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  return {
    hasPermission,
    scheduledCount,
    requestPermission,
    scheduleNotificationsForCard,
    cancelNotificationsForCard,
    refreshAllNotifications,
    checkExpiringCards,
    sendTestNotification,
    updateScheduledCount,
  };
};