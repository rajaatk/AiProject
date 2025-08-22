import { useEffect, useState } from 'react';
import { Alert, Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { router } from 'expo-router';

export default function ScanScreen() {
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const [scanned, setScanned] = useState(false);

	useEffect(() => {
		BarCodeScanner.requestPermissionsAsync().then(({ status }) => setHasPermission(status === 'granted'));
	}, []);

	const handleBarCodeScanned = ({ data }: { data: string }) => {
		if (scanned) return;
		setScanned(true);
		router.replace({ pathname: '/edit', params: { number: data } });
	};

	if (hasPermission === null) {
		return <View style={styles.center}><Text>Requesting camera permission...</Text></View>;
	}
	if (hasPermission === false) {
		return (
			<View style={styles.center}>
				<Text>No access to camera</Text>
				<Button title="Open Settings" onPress={() => Alert.alert('Grant camera permission in settings.')} />
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<BarCodeScanner
				onBarCodeScanned={handleBarCodeScanned}
				style={StyleSheet.absoluteFillObject}
			/>
			{scanned && (
				<View style={styles.overlay}><Text style={styles.overlayText}>Scanned!</Text></View>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	overlay: { position: 'absolute', bottom: 32, left: 0, right: 0, alignItems: 'center' },
	overlayText: { backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
});