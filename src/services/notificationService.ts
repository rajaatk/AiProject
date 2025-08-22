import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { GiftCard } from '../types/GiftCard';
import { DatabaseService } from './database';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  static async ensurePermissions(): Promise<boolean> {
    const hasPermission = await this.checkPermissions();
    if (hasPermission) {
      return true;
    }
    return await this.requestPermissions();
  }

  static async scheduleExpirationNotification(
    giftCard: GiftCard,
    daysBeforeExpiration: number
  ): Promise<string | null> {
    try {
      if (!giftCard.expirationDate || giftCard.isExpired) {
        return null;
      }

      const hasPermission = await this.ensurePermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return null;
      }

      const notificationDate = new Date(giftCard.expirationDate);
      notificationDate.setDate(notificationDate.getDate() - daysBeforeExpiration);

      // Don't schedule notifications for dates in the past
      if (notificationDate <= new Date()) {
        return null;
      }

      const identifier = `giftcard_${giftCard.id}_${daysBeforeExpiration}days`;

      const content: Notifications.NotificationContentInput = {
        title: '🎁 Gift Card Expiring Soon!',
        body: `Your ${giftCard.brand} gift card (${giftCard.currency}${giftCard.balance.toFixed(2)}) expires in ${daysBeforeExpiration} day${daysBeforeExpiration === 1 ? '' : 's'}.`,
        data: {
          giftCardId: giftCard.id,
          type: 'expiration_warning',
          daysBeforeExpiration,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      };

      const trigger: Notifications.NotificationTriggerInput = {
        date: notificationDate,
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier,
        content,
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async scheduleAllNotificationsForGiftCard(giftCard: GiftCard): Promise<void> {
    try {
      // Cancel existing notifications for this gift card
      await this.cancelNotificationsForGiftCard(giftCard.id);

      // Default notification days: 30, 7, 3, 1 days before expiration
      const notificationDays = [30, 7, 3, 1];

      for (const days of notificationDays) {
        await this.scheduleExpirationNotification(giftCard, days);
      }
    } catch (error) {
      console.error('Error scheduling notifications for gift card:', error);
    }
  }

  static async cancelNotificationsForGiftCard(giftCardId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      const notificationIds = scheduledNotifications
        .filter(notification => 
          notification.identifier.startsWith(`giftcard_${giftCardId}_`)
        )
        .map(notification => notification.identifier);

      if (notificationIds.length > 0) {
        await Notifications.cancelScheduledNotificationsAsync(notificationIds);
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  static async refreshAllNotifications(): Promise<void> {
    try {
      // Cancel all existing gift card notifications
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const giftCardNotificationIds = scheduledNotifications
        .filter(notification => notification.identifier.startsWith('giftcard_'))
        .map(notification => notification.identifier);

      if (giftCardNotificationIds.length > 0) {
        await Notifications.cancelScheduledNotificationsAsync(giftCardNotificationIds);
      }

      // Reschedule notifications for all active gift cards
      const allGiftCards = await DatabaseService.getAllGiftCards();
      const activeGiftCards = allGiftCards.filter(card => 
        !card.isExpired && card.balance > 0 && card.expirationDate
      );

      for (const giftCard of activeGiftCards) {
        await this.scheduleAllNotificationsForGiftCard(giftCard);
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  }

  static async sendImmediateNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    try {
      const hasPermission = await this.ensurePermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  static async checkForExpiringCards(): Promise<void> {
    try {
      const expiringCards = await DatabaseService.getExpiringGiftCards(7); // Cards expiring in next 7 days
      
      for (const card of expiringCards) {
        if (card.daysUntilExpiration !== undefined && card.daysUntilExpiration <= 1) {
          // Send immediate notification for cards expiring today or tomorrow
          await this.sendImmediateNotification(
            '⚠️ Gift Card Expiring Soon!',
            `Your ${card.brand} gift card expires ${card.daysUntilExpiration === 0 ? 'today' : 'tomorrow'}! Balance: ${card.currency}${card.balance.toFixed(2)}`,
            {
              giftCardId: card.id,
              type: 'urgent_expiration',
              daysUntilExpiration: card.daysUntilExpiration,
            }
          );
        }
      }
    } catch (error) {
      console.error('Error checking for expiring cards:', error);
    }
  }

  static setupNotificationListeners(): void {
    // Listen for notification responses (when user taps notification)
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data?.type === 'expiration_warning' || data?.type === 'urgent_expiration') {
        // Handle navigation to gift card details
        // This would typically be handled by the navigation context
        console.log('Notification tapped for gift card:', data.giftCardId);
      }
    });

    // Listen for notifications received while app is in foreground
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });
  }
}