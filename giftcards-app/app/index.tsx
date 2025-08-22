import { Link, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View, Dimensions, Platform } from 'react-native';
import { format } from 'date-fns';
import { getAllGiftCards, GiftCard } from '../lib/db';

function daysRemaining(expiryIso: string | null): number | null {
	if (!expiryIso) return null;
	const today = new Date();
	today.setHours(0,0,0,0);
	const target = new Date(expiryIso);
	target.setHours(0,0,0,0);
	return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function HomeScreen() {
	const [cards, setCards] = useState<GiftCard[]>([]);

	useEffect(() => {
		getAllGiftCards().then(setCards).catch(console.error);
	}, []);

	useFocusEffect(
		useCallback(() => {
			getAllGiftCards().then(setCards).catch(console.error);
			return () => {};
		}, [])
	);

	const numColumns = 2;

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Gift Cards</Text>
				<Link href="/edit" asChild>
					<Pressable style={styles.addBtn}><Text style={styles.addBtnText}>Add</Text></Pressable>
				</Link>
			</View>
			<FlatList
				data={cards}
				numColumns={numColumns}
				columnWrapperStyle={{ gap: 12, paddingHorizontal: 12 }}
				contentContainerStyle={{ gap: 12, paddingBottom: 80 }}
				keyExtractor={(item) => String(item.id)}
				renderItem={({ item }) => (
					<Link href={{ pathname: '/detail', params: { id: String(item.id) } }} asChild>
						<Pressable style={[styles.card, { flex: 1 }]}>
							<Text style={styles.cardTitle}>{item.merchantName}</Text>
							<Text style={styles.mono}>{item.cardNumber}</Text>
							<Text style={styles.meta}>Days: {daysRemaining(item.expiryDate ?? null) ?? '-'}</Text>
							<Text style={styles.meta}>Bal: {item.balance != null ? item.balance.toFixed(2) : '-'}</Text>
						</Pressable>
					</Link>
				)}
				ListEmptyComponent={<Text style={styles.empty}>No cards yet</Text>}
			/>
			<Link href="/scan" asChild>
				<Pressable style={styles.scanBtn}><Text style={styles.scanBtnText}>Scan</Text></Pressable>
			</Link>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	header: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	title: { fontSize: 20, fontWeight: '700' },
	addBtn: { backgroundColor: '#0ea5e9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
	addBtnText: { color: 'white', fontWeight: '600' },
	scanBtn: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#16a34a', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 },
	scanBtnText: { color: 'white', fontWeight: '700' },
	empty: { textAlign: 'center', marginTop: 24 },
	card: { padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#fafafa' },
	cardTitle: { fontWeight: '700', marginBottom: 4 },
	mono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), color: '#475569', marginBottom: 6 },
	meta: { color: '#64748b', fontSize: 12 },
});