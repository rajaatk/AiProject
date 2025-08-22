export interface GiftCard {
  id: string;
  name: string;
  brand: string;
  balance: number;
  originalAmount: number;
  currency: string;
  barcode?: string;
  barcodeType?: string;
  expirationDate?: Date;
  purchaseDate?: Date;
  notes?: string;
  imageUri?: string;
  createdAt: Date;
  updatedAt: Date;
  isExpired: boolean;
  daysUntilExpiration?: number;
}

export interface GiftCardFormData {
  name: string;
  brand: string;
  balance: number;
  originalAmount: number;
  currency: string;
  barcode?: string;
  barcodeType?: string;
  expirationDate?: string;
  purchaseDate?: string;
  notes?: string;
  imageUri?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  daysBeforeExpiration: number[];
}

export interface AppSettings {
  notifications: NotificationSettings;
  defaultCurrency: string;
  theme: 'light' | 'dark' | 'system';
}