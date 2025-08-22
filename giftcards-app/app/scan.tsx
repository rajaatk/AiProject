import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { router } from 'expo-router';

export default function ScanScreen() {
	const [hasPermission, setHasPermission] = useState<boolean | null>(Platform.OS === 'web' ? true : null);
	const [scanned, setScanned] = useState(false);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	let codeReader: any;

	useEffect(() => {
		if (Platform.OS === 'web') return;
		BarCodeScanner.requestPermissionsAsync().then(({ status }) => setHasPermission(status === 'granted'));
	}, []);

	useEffect(() => {
		if (Platform.OS !== 'web') return;
		let cleanup = () => {};
		(async () => {
			const { BrowserMultiFormatReader } = await import('@zxing/browser');
			codeReader = new BrowserMultiFormatReader();
			const videoElement = document.createElement('video');
			videoElement.setAttribute('playsinline', 'true');
			videoRef.current = videoElement;
			document.getElementById('web-camera-container')?.appendChild(videoElement);
			const controls = await codeReader.decodeFromVideoDevice(undefined, videoElement, (result: any, err: any) => {
				if (result && !scanned) {
					setScanned(true);
					router.replace({ pathname: '/edit', params: { number: result.getText() } });
				}
			});
			cleanup = () => controls.stop();
		})().catch((e) => console.error(e));
		return cleanup;
	}, [scanned]);

	const handleBarCodeScanned = ({ data }: { data: string }) => {
		if (scanned) return;
		setScanned(true);
		router.replace({ pathname: '/edit', params: { number: data } });
	};

	if (Platform.OS !== 'web' && hasPermission === null) {
		return <View style={styles.center}><Text>Requesting camera permission...</Text></View>;
	}
	if (Platform.OS !== 'web' && hasPermission === false) {
		return (
			<View style={styles.center}>
				<Text>No access to camera</Text>
				<Button title="Open Settings" onPress={() => Alert.alert('Grant camera permission in settings.')} />
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{Platform.OS === 'web' ? (
				<View style={styles.webContainer}>
					<View nativeID="web-camera-container" style={styles.webCamera} />
					{scanned && (
						<View style={styles.overlay}><Text style={styles.overlayText}>Scanned!</Text></View>
					)}
				</View>
			) : (
				<BarCodeScanner onBarCodeScanned={handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	overlay: { position: 'absolute', bottom: 32, left: 0, right: 0, alignItems: 'center' },
	overlayText: { backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
	webContainer: { flex: 1 },
	webCamera: { flex: 1 },
});