import { useEffect, useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getGiftCardById, GiftCard } from '../lib/db';

export default function DetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [card, setCard] = useState<GiftCard | null>(null);

	useEffect(() => {
		if (!id) return;
		getGiftCardById(Number(id)).then(setCard);
	}, [id]);

	if (!card) return <SafeAreaView style={styles.center}><Text>Loading...</Text></SafeAreaView>;

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.title}>{card.merchantName}</Text>
			<Text>Number: {card.cardNumber}</Text>
			{card.expiryDate && <Text>Expiry: {new Date(card.expiryDate).toDateString()}</Text>}
			{card.notes && <Text>Notes: {card.notes}</Text>}
			<View style={styles.row}>
				<Button title="Edit" onPress={() => router.push({ pathname: '/edit', params: { id: String(card.id) } })} />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, gap: 12 },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	title: { fontSize: 22, fontWeight: '800' },
	row: { flexDirection: 'row', gap: 12 },
});