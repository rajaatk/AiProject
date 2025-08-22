import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Platform, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { upsertGiftCard, getGiftCardById, GiftCard } from '../lib/db';
import * as Notifications from 'expo-notifications';
import { useToast } from '../lib/toast';

export default function EditScreen() {
	const params = useLocalSearchParams<{ id?: string; number?: string }>();
	const isEditing = useMemo(() => Boolean(params.id), [params.id]);
	const [merchantName, setMerchantName] = useState('');
	const [cardNumber, setCardNumber] = useState(params.number ?? '');
	const [notes, setNotes] = useState('');
	const [expiryDate, setExpiryDate] = useState(''); // YYYY-MM-DD
	const [balance, setBalance] = useState(''); // string input
	const toast = useToast();

	useEffect(() => {
		if (params.id) {
			getGiftCardById(Number(params.id)).then((card) => {
				if (!card) return;
				setMerchantName(card.merchantName);
				setCardNumber(card.cardNumber);
				setNotes(card.notes ?? '');
				setExpiryDate(card.expiryDate ? String(card.expiryDate).slice(0, 10) : '');
				setBalance(card.balance != null ? String(card.balance) : '');
			});
		}
	}, [params.id]);

	async function scheduleExpiryNotification(dateIso: string, merchant: string) {
		if (Platform.OS === 'web') return; // notifications not scheduled on web
		if (!dateIso) return;
		const targetDate = new Date(dateIso);
		if (isNaN(targetDate.getTime())) return;
		await Notifications.requestPermissionsAsync();
		await Notifications.scheduleNotificationAsync({
			content: { title: 'Gift card expiring', body: `${merchant} expires ${targetDate.toDateString()}` },
			trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: targetDate },
		});
	}

	async function onSave() {
		try {
			if (!merchantName.trim() || !cardNumber.trim()) {
				toast.show('Merchant and card number are required', 'error');
				return;
			}
			const payload: Omit<GiftCard, 'id'> = {
				merchantName: merchantName.trim(),
				cardNumber: cardNumber.trim(),
				notes: notes.trim() || null,
				expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
				balance: balance.trim() ? Number(balance) : null,
			};
			const id = params.id ? Number(params.id) : undefined;
			const savedId = await upsertGiftCard(payload, id);
			if (payload.expiryDate) {
				await scheduleExpiryNotification(payload.expiryDate, payload.merchantName);
			}
			toast.show('Gift card saved', 'success');
			router.replace(`/detail?id=${savedId}`);
		} catch (e) {
			console.error(e);
			toast.show('Failed to save gift card', 'error');
			Alert.alert('Error', 'Failed to save gift card.');
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.formRow}>
				<Text style={styles.label}>Merchant</Text>
				<TextInput style={styles.input} value={merchantName} onChangeText={setMerchantName} placeholder="Store name" />
			</View>
			<View style={styles.formRow}>
				<Text style={styles.label}>Card Number</Text>
				<TextInput style={styles.input} value={cardNumber} onChangeText={setCardNumber} placeholder="1234..." />
			</View>
			<View style={styles.formRow}>
				<Text style={styles.label}>Expiry (YYYY-MM-DD)</Text>
				<TextInput style={styles.input} value={expiryDate} onChangeText={setExpiryDate} placeholder="2025-12-31" />
			</View>
			<View style={styles.formRow}>
				<Text style={styles.label}>Balance</Text>
				<TextInput style={styles.input} value={balance} onChangeText={setBalance} keyboardType="decimal-pad" placeholder="0.00" />
			</View>
			<View style={styles.formRow}>
				<Text style={styles.label}>Notes</Text>
				<TextInput style={[styles.input, styles.multiline]} value={notes} onChangeText={setNotes} placeholder="Optional" multiline />
			</View>
			<Button title={isEditing ? 'Update' : 'Save'} onPress={onSave} />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	formRow: { marginBottom: 12 },
	label: { fontWeight: '700' },
	input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
	multiline: { minHeight: 80, textAlignVertical: 'top' },
});