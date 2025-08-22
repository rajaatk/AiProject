import { useEffect, useState } from 'react';
import { Alert, Button, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getGiftCardById, deleteGiftCard, GiftCard } from '../lib/db';
import { useToast } from '../lib/toast';

function daysRemaining(expiryIso: string | null): number | null {
	if (!expiryIso) return null;
	const today = new Date();
	today.setHours(0,0,0,0);
	const target = new Date(expiryIso);
	target.setHours(0,0,0,0);
	return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [card, setCard] = useState<GiftCard | null>(null);
	const toast = useToast();

	useEffect(() => {
		if (!id) return;
		getGiftCardById(Number(id)).then(setCard);
	}, [id]);

	async function onDelete() {
		if (!card?.id) return;
		if (Platform.OS === 'web') {
			// eslint-disable-next-line no-restricted-globals
			const ok = typeof window !== 'undefined' ? window.confirm('Are you sure you want to delete this card?') : false;
			if (!ok) return;
			await deleteGiftCard(card.id!);
			toast.show('Card deleted', 'success');
			router.replace('/');
			return;
		}
		Alert.alert('Delete', 'Are you sure you want to delete this card?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Delete', style: 'destructive', onPress: async () => {
				await deleteGiftCard(card.id!);
				toast.show('Card deleted', 'success');
				router.replace('/');
			} },
		]);
	}

	if (!card) return <SafeAreaView style={styles.center}><Text>Loading...</Text></SafeAreaView>;

	const remaining = daysRemaining(card.expiryDate ?? null);

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.title}>{card.merchantName}</Text>
			<View style={styles.table}>
				<View style={styles.row}><Text style={styles.th}>Card Number</Text><Text style={styles.td}>{card.cardNumber}</Text></View>
				<View style={styles.row}><Text style={styles.th}>Expiry Date</Text><Text style={styles.td}>{card.expiryDate ? new Date(card.expiryDate).toDateString() : '-'}</Text></View>
				<View style={styles.row}><Text style={styles.th}>Days Remaining</Text><Text style={styles.td}>{remaining ?? '-'}</Text></View>
				<View style={styles.row}><Text style={styles.th}>Balance</Text><Text style={styles.td}>{card.balance != null ? card.balance.toFixed(2) : '-'}</Text></View>
				{card.notes ? (<View style={styles.row}><Text style={styles.th}>Notes</Text><Text style={styles.td}>{card.notes}</Text></View>) : null}
			</View>
			<View style={styles.actions}>
				<View style={{ marginRight: 12 }}>
					<Button title="Edit" onPress={() => router.push({ pathname: '/edit', params: { id: String(card.id) } })} />
				</View>
				<Button title="Delete" color="#dc2626" onPress={onDelete} />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	title: { fontSize: 22, fontWeight: '800' },
	table: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden' },
	row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
	th: { fontWeight: '700', width: '40%' },
	td: { width: '60%', textAlign: 'right' },
	actions: { flexDirection: 'row' },
});