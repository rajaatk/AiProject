import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  Alert,
  Dimensions,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { BarcodeScannerService, ScannedBarcode } from '../services/barcodeScanner';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

interface Props {
  onBarcodeScanned?: (barcode: ScannedBarcode) => void;
}

export const BarcodeScannerScreen: React.FC<Props> = ({ onBarcodeScanned }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const granted = await BarcodeScannerService.ensureCameraPermission();
    setHasPermission(granted);
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);
    Vibration.vibrate(100);

    // Validate barcode data
    if (!BarcodeScannerService.validateBarcodeData(data, type)) {
      Alert.alert(
        'Invalid Barcode',
        'The scanned barcode appears to be invalid. Please try scanning again.',
        [
          {
            text: 'Scan Again',
            onPress: () => setScanned(false),
          },
        ]
      );
      return;
    }

    const formattedType = BarcodeScannerService.formatBarcodeType(type);
    const giftCardInfo = BarcodeScannerService.extractGiftCardInfo(data, type);

    Alert.alert(
      'Barcode Scanned',
      `Type: ${formattedType}\nData: ${data}${giftCardInfo.brand ? `\nDetected Brand: ${giftCardInfo.brand}` : ''}`,
      [
        {
          text: 'Scan Again',
          style: 'cancel',
          onPress: () => setScanned(false),
        },
        {
          text: 'Add Gift Card',
          onPress: () => {
            if (onBarcodeScanned) {
              onBarcodeScanned({ type: formattedType, data });
            } else {
              // Navigate to add gift card screen with scanned data
              navigation.navigate('AddGiftCard' as never, {
                barcode: data,
                barcodeType: formattedType,
                brand: giftCardInfo.brand || '',
              } as never);
            }
          },
        },
      ]
    );
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  const goBack = () => {
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Camera permission is required to scan barcodes
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.scanner}
        barCodeTypes={BarcodeScannerService.getSupportedBarcodeTypes()}
        flashMode={flashEnabled ? 'torch' : 'off'}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={goBack}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Gift Card</Text>
          <TouchableOpacity style={styles.headerButton} onPress={toggleFlash}>
            <Ionicons
              name={flashEnabled ? 'flash' : 'flash-off'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Scanning area */}
        <View style={styles.scanningArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Position the barcode within the frame
          </Text>
          <Text style={styles.instructionSubtext}>
            The barcode will be scanned automatically
          </Text>
        </View>

        {/* Manual retry button */}
        {scanned && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setScanned(false)}
          >
            <Ionicons name="refresh" size={24} color="white" />
            <Text style={styles.retryButtonText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  scanningArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00ff00',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructions: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 40,
    marginBottom: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  message: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});