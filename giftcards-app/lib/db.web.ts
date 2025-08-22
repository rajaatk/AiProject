export type GiftCard = {
	id?: number;
	merchantName: string;
	cardNumber: string;
	notes: string | null;
	expiryDate: string | null; // ISO
	balance: number | null;
};

const STORAGE_KEY = 'giftcards:v1';

type Store = {
	nextId: number;
	items: GiftCard[];
};

function loadStore(): Store {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { nextId: 1, items: [] };
		const parsed = JSON.parse(raw) as Store;
		if (!parsed || !Array.isArray(parsed.items)) return { nextId: 1, items: [] };
		return { nextId: parsed.nextId ?? 1, items: parsed.items ?? [] };
	} catch {
		return { nextId: 1, items: [] };
	}
}

function saveStore(store: Store) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export async function upsertGiftCard(card: Omit<GiftCard, 'id'>, id?: number): Promise<number> {
	const store = loadStore();
	if (id) {
		store.items = store.items.map((c) => (c.id === id ? { ...card, id } : c));
		saveStore(store);
		return id;
	}
	const newId = store.nextId++;
	store.items.push({ ...card, id: newId });
	saveStore(store);
	return newId;
}

export async function getAllGiftCards(): Promise<GiftCard[]> {
	const store = loadStore();
	return store.items
		.slice()
		.sort((a, b) => {
			const aDate = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
			const bDate = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
			if (aDate !== bDate) return aDate - bDate;
			return a.merchantName.localeCompare(b.merchantName);
		});
}

export async function getGiftCardById(id: number): Promise<GiftCard | null> {
	const store = loadStore();
	return store.items.find((c) => c.id === id) ?? null;
}

export async function deleteGiftCard(id: number): Promise<void> {
	const store = loadStore();
	store.items = store.items.filter((c) => c.id !== id);
	saveStore(store);
}