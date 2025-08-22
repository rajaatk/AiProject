import AsyncStorage from '@react-native-async-storage/async-storage';
import { GiftCard } from '../types/giftCard';

const GIFT_CARDS_KEY = 'gift_cards';
const SETTINGS_KEY = 'app_settings';

export class StorageService {
  // Gift Cards CRUD operations
  static async getAllGiftCards(): Promise<GiftCard[]> {
    try {
      const cardsJson = await AsyncStorage.getItem(GIFT_CARDS_KEY);
      return cardsJson ? JSON.parse(cardsJson) : [];
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      return [];
    }
  }

  static async saveGiftCard(card: GiftCard): Promise<void> {
    try {
      const cards = await this.getAllGiftCards();
      const existingIndex = cards.findIndex(c => c.id === card.id);
      
      if (existingIndex >= 0) {
        cards[existingIndex] = { ...card, updatedAt: new Date().toISOString() };
      } else {
        cards.push({ ...card, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      
      await AsyncStorage.setItem(GIFT_CARDS_KEY, JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving gift card:', error);
      throw error;
    }
  }

  static async deleteGiftCard(cardId: string): Promise<void> {
    try {
      const cards = await this.getAllGiftCards();
      const filteredCards = cards.filter(card => card.id !== cardId);
      await AsyncStorage.setItem(GIFT_CARDS_KEY, JSON.stringify(filteredCards));
    } catch (error) {
      console.error('Error deleting gift card:', error);
      throw error;
    }
  }

  static async getGiftCardById(cardId: string): Promise<GiftCard | null> {
    try {
      const cards = await this.getAllGiftCards();
      return cards.find(card => card.id === cardId) || null;
    } catch (error) {
      console.error('Error fetching gift card by ID:', error);
      return null;
    }
  }

  static async getExpiringCards(daysThreshold: number = 30): Promise<GiftCard[]> {
    try {
      const cards = await this.getAllGiftCards();
      const now = new Date();
      const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
      
      return cards.filter(card => {
        const expiryDate = new Date(card.expirationDate);
        return expiryDate <= thresholdDate && card.isActive;
      });
    } catch (error) {
      console.error('Error fetching expiring cards:', error);
      return [];
    }
  }

  // Settings operations
  static async getSettings(): Promise<any> {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : this.getDefaultSettings();
    } catch (error) {
      console.error('Error fetching settings:', error);
      return this.getDefaultSettings();
    }
  }

  static async saveSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  private static getDefaultSettings() {
    return {
      notifications: {
        enabled: true,
        daysBeforeExpiry: [7, 3, 1],
        reminderTime: '09:00'
      },
      currency: 'USD',
      theme: 'light',
      language: 'en'
    };
  }
}