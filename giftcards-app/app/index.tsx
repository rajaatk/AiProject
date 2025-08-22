import { Link, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { getAllGiftCards, GiftCard } from '../lib/db';

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
				keyExtractor={(item) => String(item.id)}
				renderItem={({ item }) => (
					<Link href={{ pathname: '/detail', params: { id: String(item.id) } }} asChild>
						<Pressable style={styles.card}>
							<Text style={styles.cardTitle}>{item.merchantName}</Text>
							<Text>Number: {item.cardNumber}</Text>
							{item.expiryDate && (
								<Text>Expires: {format(new Date(item.expiryDate), 'PPP')}</Text>
							)}
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
	card: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd' },
	cardTitle: { fontWeight: '700', marginBottom: 4 },
});