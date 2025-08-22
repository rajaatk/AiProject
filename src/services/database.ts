import * as SQLite from 'expo-sqlite';
import { GiftCard, GiftCardFormData } from '../types/GiftCard';
import uuid from 'react-native-uuid';

const db = SQLite.openDatabase('giftcards.db');

export class DatabaseService {
  static initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS gift_cards (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              brand TEXT NOT NULL,
              balance REAL NOT NULL,
              original_amount REAL NOT NULL,
              currency TEXT NOT NULL DEFAULT 'USD',
              barcode TEXT,
              barcode_type TEXT,
              expiration_date TEXT,
              purchase_date TEXT,
              notes TEXT,
              image_uri TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );`
          );
          
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS settings (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL
            );`
          );
        },
        (error) => reject(error),
        () => resolve()
      );
    });
  }

  static async getAllGiftCards(): Promise<GiftCard[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM gift_cards ORDER BY created_at DESC',
          [],
          (_, { rows }) => {
            const giftCards: GiftCard[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              const giftCard = this.mapRowToGiftCard(row);
              giftCards.push(giftCard);
            }
            resolve(giftCards);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static async addGiftCard(data: GiftCardFormData): Promise<string> {
    const id = uuid.v4() as string;
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO gift_cards (
            id, name, brand, balance, original_amount, currency,
            barcode, barcode_type, expiration_date, purchase_date,
            notes, image_uri, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            data.name,
            data.brand,
            data.balance,
            data.originalAmount,
            data.currency,
            data.barcode || null,
            data.barcodeType || null,
            data.expirationDate || null,
            data.purchaseDate || null,
            data.notes || null,
            data.imageUri || null,
            now,
            now
          ],
          () => resolve(id),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static async updateGiftCard(id: string, data: Partial<GiftCardFormData>): Promise<void> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return;

    fields.push('updated_at = ?');
    values.push(now, id);

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE gift_cards SET ${fields.join(', ')} WHERE id = ?`,
          values,
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static async deleteGiftCard(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM gift_cards WHERE id = ?',
          [id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static async getGiftCardById(id: string): Promise<GiftCard | null> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM gift_cards WHERE id = ?',
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              const giftCard = this.mapRowToGiftCard(rows.item(0));
              resolve(giftCard);
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static async getExpiringGiftCards(days: number): Promise<GiftCard[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM gift_cards 
           WHERE expiration_date IS NOT NULL 
           AND expiration_date BETWEEN ? AND ? 
           AND balance > 0
           ORDER BY expiration_date ASC`,
          [todayStr, targetDateStr],
          (_, { rows }) => {
            const giftCards: GiftCard[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              const giftCard = this.mapRowToGiftCard(row);
              giftCards.push(giftCard);
            }
            resolve(giftCards);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  private static mapRowToGiftCard(row: any): GiftCard {
    const expirationDate = row.expiration_date ? new Date(row.expiration_date) : undefined;
    const purchaseDate = row.purchase_date ? new Date(row.purchase_date) : undefined;
    const createdAt = new Date(row.created_at);
    const updatedAt = new Date(row.updated_at);

    const now = new Date();
    const isExpired = expirationDate ? expirationDate < now : false;
    const daysUntilExpiration = expirationDate 
      ? Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : undefined;

    return {
      id: row.id,
      name: row.name,
      brand: row.brand,
      balance: row.balance,
      originalAmount: row.original_amount,
      currency: row.currency,
      barcode: row.barcode,
      barcodeType: row.barcode_type,
      expirationDate,
      purchaseDate,
      notes: row.notes,
      imageUri: row.image_uri,
      createdAt,
      updatedAt,
      isExpired,
      daysUntilExpiration
    };
  }
}