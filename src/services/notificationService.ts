import PushNotification from 'react-native-push-notification';
import { GiftCard } from '../types/giftCard';
import { StorageService } from './storageService';

export class NotificationService {
  static init() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    PushNotification.createChannel(
      {
        channelId: 'gift-card-expiry',
        channelName: 'Gift Card Expiry Reminders',
        channelDescription: 'Notifications for gift card expiration',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }

  static async scheduleExpiryNotification(card: GiftCard) {
    try {
      const settings = await StorageService.getSettings();
      if (!settings.notifications.enabled) return;

      const expiryDate = new Date(card.expirationDate);
      const now = new Date();

      // Schedule notifications for each configured day before expiry
      for (const daysBefore of settings.notifications.daysBeforeExpiry) {
        const notificationDate = new Date(expiryDate.getTime() - daysBefore * 24 * 60 * 60 * 1000);
        
        if (notificationDate > now) {
          this.scheduleNotification(card, notificationDate, daysBefore);
        }
      }

      // Schedule notification for the actual expiry date
      if (expiryDate > now) {
        this.scheduleNotification(card, expiryDate, 0);
      }
    } catch (error) {
      console.error('Error scheduling expiry notification:', error);
    }
  }

  private static scheduleNotification(card: GiftCard, date: Date, daysBefore: number) {
    const notificationId = `gift_card_${card.id}_${daysBefore}`;
    
    let message = '';
    if (daysBefore === 0) {
      message = `Your ${card.name} gift card expires today!`;
    } else {
      message = `Your ${card.name} gift card expires in ${daysBefore} day${daysBefore === 1 ? '' : 's'}!`;
    }

    PushNotification.localNotificationSchedule({
      id: notificationId,
      channelId: 'gift-card-expiry',
      title: 'Gift Card Expiry Reminder',
      message: message,
      date: date,
      allowWhileIdle: true,
      repeatType: 'day',
      repeatTime: 1,
      data: {
        cardId: card.id,
        cardName: card.name,
        daysBefore: daysBefore,
      },
    });
  }

  static async cancelExpiryNotifications(cardId: string) {
    try {
      const settings = await StorageService.getSettings();
      
      // Cancel all notifications for this card
      for (const daysBefore of settings.notifications.daysBeforeExpiry) {
        const notificationId = `gift_card_${cardId}_${daysBefore}`;
        PushNotification.cancelLocalNotification(notificationId);
      }
      
      // Cancel expiry day notification
      const expiryNotificationId = `gift_card_${cardId}_0`;
      PushNotification.cancelLocalNotification(expiryNotificationId);
    } catch (error) {
      console.error('Error canceling expiry notifications:', error);
    }
  }

  static async scheduleAllExpiryNotifications() {
    try {
      const cards = await StorageService.getAllGiftCards();
      const activeCards = cards.filter(card => card.isActive);
      
      for (const card of activeCards) {
        await this.scheduleExpiryNotification(card);
      }
    } catch (error) {
      console.error('Error scheduling all expiry notifications:', error);
    }
  }

  static async cancelAllNotifications() {
    try {
      PushNotification.cancelAllLocalNotifications();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }
}