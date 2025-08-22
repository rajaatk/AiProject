import { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

type Card = { id: number; merchant: string; number: string };

type Errors = { merchant?: string; number?: string };

export default function App() {
	const [cards, setCards] = useState<Card[]>([]);
	const [merchant, setMerchant] = useState('');
	const [number, setNumber] = useState('');
	const [touched, setTouched] = useState<{ merchant?: boolean; number?: boolean }>({});

	const errors: Errors = useMemo(() => {
		const e: Errors = {};
		if (!merchant.trim()) e.merchant = 'Merchant is required';
		if (!number.trim()) e.number = 'Card number is required';
		else if (!/^[-A-Za-z0-9 ]{4,}$/.test(number.trim())) e.number = 'Enter at least 4 valid characters';
		return e;
	}, [merchant, number]);

	const isValid = Object.keys(errors).length === 0;

	function resetForm() {
		setMerchant('');
		setNumber('');
		setTouched({});
	}

	function onAdd() {
		setTouched({ merchant: true, number: true });
		if (!isValid) return;
		const newCard: Card = { id: Date.now(), merchant: merchant.trim(), number: number.trim() };
		setCards((prev) => [newCard, ...prev]);
		resetForm();
	}

	function onDelete(id: number) {
		setCards((prev) => prev.filter((c) => c.id !== id));
	}

	return (
		<SafeAreaView style={styles.safe}>
			<KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: 'height' })} style={styles.container}>
				<View style={styles.header}><Text style={styles.title}>Gift Cards</Text></View>
				<View style={styles.form}>
					<Text style={styles.label}>Merchant</Text>
					<TextInput
						style={[styles.input, touched.merchant && errors.merchant ? styles.inputError : null]}
						value={merchant}
						onChangeText={setMerchant}
						onBlur={() => setTouched((t) => ({ ...t, merchant: true }))}
						placeholder="Store name"
					/>
					{touched.merchant && errors.merchant ? <Text style={styles.error}>{errors.merchant}</Text> : null}

					<Text style={styles.label}>Card Number</Text>
					<TextInput
						style={[styles.input, touched.number && errors.number ? styles.inputError : null]}
						value={number}
						onChangeText={setNumber}
						onBlur={() => setTouched((t) => ({ ...t, number: true }))}
						placeholder="1234..."
					/>
					{touched.number && errors.number ? <Text style={styles.error}>{errors.number}</Text> : null}

					<Pressable onPress={onAdd} style={[styles.button, !isValid ? styles.buttonDisabled : null]}>
						<Text style={{ color: 'white', fontWeight: '700' }}>Add</Text>
					</Pressable>
				</View>

				<FlatList
					data={cards}
					keyExtractor={(item) => String(item.id)}
					ItemSeparatorComponent={() => <View style={styles.sep} />}
					renderItem={({ item }) => (
						<View style={styles.row}>
							<View style={{ flex: 1 }}>
								<Text style={styles.rowTitle}>{item.merchant}</Text>
								<Text style={styles.rowSub}>{item.number}</Text>
							</View>
							<Pressable onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
								<Text style={styles.deleteText}>Delete</Text>
							</Pressable>
						</View>
					)}
					ListEmptyComponent={<Text style={styles.empty}>No cards yet</Text>}
				/>
				<StatusBar style="auto" />
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: '#fff' },
	container: { flex: 1, padding: 16 },
	header: { paddingVertical: 8 },
	title: { fontSize: 20, fontWeight: '700' },
	form: { marginTop: 8, marginBottom: 16 },
	label: { fontWeight: '700', marginTop: 10, marginBottom: 6 },
	input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
	inputError: { borderColor: '#dc2626' },
	error: { color: '#dc2626', marginTop: 4 },
	button: { backgroundColor: '#0ea5e9', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginTop: 12 },
	buttonDisabled: { opacity: 0.6 },
	sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#eee' },
	row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
	rowTitle: { fontWeight: '700' },
	rowSub: { color: '#64748b' },
	deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#fee2e2' },
	deleteText: { color: '#b91c1c', fontWeight: '700' },
	empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },
});
