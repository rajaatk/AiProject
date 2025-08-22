import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { RootStackParamList } from '../types/navigation';
import { GiftCard, GiftCardFormData } from '../types/giftCard';
import { StorageService } from '../services/storageService';
import { NotificationService } from '../services/notificationService';

type ScanScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

const { width, height } = Dimensions.get('window');

const ScanScreen: React.FC = () => {
  const navigation = useNavigation<ScanScreenNavigationProp>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera access to scan gift cards.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn(err);
        setHasPermission(false);
      }
    } else {
      setHasPermission(true);
    }
  };

  const handleQRCodeRead = (event: any) => {
    if (isScanning) return;
    
    setIsScanning(true);
    const data = event.data;
    setScannedData(data);
    
    // Process the scanned data
    processScannedData(data);
  };

  const processScannedData = (data: string) => {
    try {
      // Try to parse as JSON first (for structured data)
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        // If not JSON, treat as plain text
        parsedData = { rawData: data };
      }

      // Extract gift card information
      const giftCardData: Partial<GiftCardFormData> = {
        name: parsedData.name || parsedData.cardName || 'Scanned Gift Card',
        cardNumber: parsedData.cardNumber || parsedData.number || parsedData.rawData || data,
        balance: parsedData.balance || parsedData.amount || 0,
        currency: parsedData.currency || 'USD',
        expirationDate: parsedData.expirationDate || parsedData.expiry || '',
        store: parsedData.store || parsedData.merchant || 'Unknown Store',
        category: parsedData.category || 'Gift Card',
        notes: `Scanned on ${new Date().toLocaleDateString()}`,
      };

      // Navigate to add card screen with pre-filled data
      navigation.navigate('AddCard', { scannedData: giftCardData });
    } catch (error) {
      console.error('Error processing scanned data:', error);
      Alert.alert(
        'Scan Error',
        'Unable to process the scanned data. Please try scanning again or add the card manually.',
        [
          { text: 'Try Again', onPress: () => setIsScanning(false) },
          { text: 'Add Manually', onPress: () => navigation.navigate('AddCard') },
        ]
      );
    }
  };

  const handleManualAdd = () => {
    navigation.navigate('AddCard');
  };

  const handleBackToScan = () => {
    setScannedData('');
    setIsScanning(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Icon name="camera-alt" size={64} color="#8E8E93" />
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Icon name="camera-off" size={64} color="#FF3B30" />
          <Text style={styles.permissionText}>Camera permission denied</Text>
          <Text style={styles.permissionSubtext}>
            Please enable camera access in your device settings to scan gift cards.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manualButton} onPress={handleManualAdd}>
            <Text style={styles.manualButtonText}>Add Manually Instead</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (scannedData) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Icon name="check-circle" size={64} color="#34C759" />
          <Text style={styles.resultTitle}>Scan Successful!</Text>
          <Text style={styles.resultData}>{scannedData}</Text>
          <View style={styles.resultButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('AddCard', { scannedData: { rawData: scannedData } })}>
              <Text style={styles.primaryButtonText}>Continue to Add Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToScan}>
              <Text style={styles.secondaryButtonText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan Gift Card</Text>
        <Text style={styles.headerSubtitle}>
          Position the QR code or barcode within the frame
        </Text>
      </View>

      <View style={styles.scannerContainer}>
        <QRCodeScanner
          onRead={handleQRCodeRead}
          flashMode={RNCamera.Constants.FlashMode.auto}
          topContent={
            <View style={styles.scannerOverlay}>
              <View style={styles.scanFrame}>
                <View style={styles.corner} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>
            </View>
          }
          bottomContent={
            <View style={styles.scannerBottom}>
              <Text style={styles.scannerHint}>
                Hold your device steady and align the code
              </Text>
              <TouchableOpacity style={styles.manualButton} onPress={handleManualAdd}>
                <Text style={styles.manualButtonText}>Add Manually</Text>
              </TouchableOpacity>
            </View>
          }
          cameraStyle={styles.camera}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    height: height - 200,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#007AFF',
    borderTopWidth: 4,
    borderLeftWidth: 4,
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    top: 'auto',
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 4,
  },
  cornerBottomRight: {
    top: 'auto',
    bottom: 0,
    right: 0,
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scannerBottom: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  scannerHint: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#000000',
  },
  permissionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionSubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  manualButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#8E8E93',
  },
  manualButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#000000',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 20,
  },
  resultData: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  resultButtons: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#8E8E93',
  },
  secondaryButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ScanScreen;