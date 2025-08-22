export interface GiftCard {
  id: string;
  name: string;
  cardNumber: string;
  balance: number;
  currency: string;
  expirationDate: string;
  store: string;
  category: string;
  notes?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GiftCardFormData {
  name: string;
  cardNumber: string;
  balance: number;
  currency: string;
  expirationDate: string;
  store: string;
  category: string;
  notes?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  daysBeforeExpiry: number[];
  reminderTime: string;
}

export interface AppSettings {
  notifications: NotificationSettings;
  currency: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}