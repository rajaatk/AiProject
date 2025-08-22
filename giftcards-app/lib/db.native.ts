import * as SQLite from 'expo-sqlite';

export type GiftCard = {
	id?: number;
	merchantName: string;
	cardNumber: string;
	notes: string | null;
	expiryDate: string | null; // ISO
};

let database: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
	if (database) return database;
	database = await SQLite.openDatabaseAsync('giftcards.db');
	await database.execAsync(`
		CREATE TABLE IF NOT EXISTS gift_cards (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			merchant_name TEXT NOT NULL,
			card_number TEXT NOT NULL,
			notes TEXT,
			expiry_date TEXT
		);
	`);
	return database;
}

export async function upsertGiftCard(card: Omit<GiftCard, 'id'>, id?: number): Promise<number> {
	const db = await getDb();
	if (id) {
		await db.runAsync(
			`UPDATE gift_cards SET merchant_name=?, card_number=?, notes=?, expiry_date=? WHERE id=?`,
			[card.merchantName, card.cardNumber, card.notes, card.expiryDate, id]
		);
		return id;
	} else {
		const res = await db.runAsync(
			`INSERT INTO gift_cards (merchant_name, card_number, notes, expiry_date) VALUES (?, ?, ?, ?)`,
			[card.merchantName, card.cardNumber, card.notes, card.expiryDate]
		);
		return res.lastInsertRowId as number;
	}
}

export async function getAllGiftCards(): Promise<GiftCard[]> {
	const db = await getDb();
	const rows = await db.getAllAsync<{
		id: number; merchant_name: string; card_number: string; notes: string | null; expiry_date: string | null;
	}>(`SELECT * FROM gift_cards ORDER BY COALESCE(expiry_date, '9999-12-31') ASC, merchant_name ASC`);
	return rows.map((r) => ({ id: r.id, merchantName: r.merchant_name, cardNumber: r.card_number, notes: r.notes, expiryDate: r.expiry_date }));
}

export async function getGiftCardById(id: number): Promise<GiftCard | null> {
	const db = await getDb();
	const row = await db.getFirstAsync<{
		id: number; merchant_name: string; card_number: string; notes: string | null; expiry_date: string | null;
	}>(`SELECT * FROM gift_cards WHERE id=?`, [id]);
	return row ? { id: row.id, merchantName: row.merchant_name, cardNumber: row.card_number, notes: row.notes, expiryDate: row.expiry_date } : null;
}

export async function deleteGiftCard(id: number): Promise<void> {
	const db = await getDb();
	await db.runAsync(`DELETE FROM gift_cards WHERE id=?`, [id]);
}