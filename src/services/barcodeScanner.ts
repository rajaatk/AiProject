import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import { Alert } from 'react-native';

export interface ScannedBarcode {
  type: string;
  data: string;
}

export class BarcodeScannerService {
  static async requestCameraPermission(): Promise<boolean> {
    try {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  static async checkCameraPermission(): Promise<boolean> {
    try {
      const { status } = await BarCodeScanner.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return false;
    }
  }

  static async ensureCameraPermission(): Promise<boolean> {
    const hasPermission = await this.checkCameraPermission();
    if (hasPermission) {
      return true;
    }

    const granted = await this.requestCameraPermission();
    if (!granted) {
      Alert.alert(
        'Camera Permission Required',
        'This app needs camera access to scan gift card barcodes. Please enable camera permission in your device settings.',
        [{ text: 'OK' }]
      );
    }
    return granted;
  }

  static getSupportedBarcodeTypes(): string[] {
    return [
      BarCodeScanner.Constants.BarCodeType.aztec,
      BarCodeScanner.Constants.BarCodeType.ean13,
      BarCodeScanner.Constants.BarCodeType.ean8,
      BarCodeScanner.Constants.BarCodeType.qr,
      BarCodeScanner.Constants.BarCodeType.pdf417,
      BarCodeScanner.Constants.BarCodeType.upc_e,
      BarCodeScanner.Constants.BarCodeType.datamatrix,
      BarCodeScanner.Constants.BarCodeType.code128,
      BarCodeScanner.Constants.BarCodeType.code39,
      BarCodeScanner.Constants.BarCodeType.code93,
      BarCodeScanner.Constants.BarCodeType.codabar,
      BarCodeScanner.Constants.BarCodeType.ean13,
      BarCodeScanner.Constants.BarCodeType.ean8,
      BarCodeScanner.Constants.BarCodeType.itf14,
      BarCodeScanner.Constants.BarCodeType.upc_a,
    ];
  }

  static validateBarcodeData(data: string, type: string): boolean {
    if (!data || data.trim().length === 0) {
      return false;
    }

    // Basic validation based on barcode type
    switch (type) {
      case BarCodeScanner.Constants.BarCodeType.ean13:
        return /^\d{13}$/.test(data);
      case BarCodeScanner.Constants.BarCodeType.ean8:
        return /^\d{8}$/.test(data);
      case BarCodeScanner.Constants.BarCodeType.upc_a:
        return /^\d{12}$/.test(data);
      case BarCodeScanner.Constants.BarCodeType.upc_e:
        return /^\d{6,8}$/.test(data);
      case BarCodeScanner.Constants.BarCodeType.code128:
      case BarCodeScanner.Constants.BarCodeType.code39:
      case BarCodeScanner.Constants.BarCodeType.code93:
        return data.length >= 1 && data.length <= 80;
      case BarCodeScanner.Constants.BarCodeType.qr:
        return data.length >= 1 && data.length <= 4000;
      default:
        return data.length >= 1 && data.length <= 100;
    }
  }

  static formatBarcodeType(type: string): string {
    switch (type) {
      case BarCodeScanner.Constants.BarCodeType.ean13:
        return 'EAN-13';
      case BarCodeScanner.Constants.BarCodeType.ean8:
        return 'EAN-8';
      case BarCodeScanner.Constants.BarCodeType.upc_a:
        return 'UPC-A';
      case BarCodeScanner.Constants.BarCodeType.upc_e:
        return 'UPC-E';
      case BarCodeScanner.Constants.BarCodeType.code128:
        return 'Code 128';
      case BarCodeScanner.Constants.BarCodeType.code39:
        return 'Code 39';
      case BarCodeScanner.Constants.BarCodeType.code93:
        return 'Code 93';
      case BarCodeScanner.Constants.BarCodeType.qr:
        return 'QR Code';
      case BarCodeScanner.Constants.BarCodeType.pdf417:
        return 'PDF417';
      case BarCodeScanner.Constants.BarCodeType.aztec:
        return 'Aztec';
      case BarCodeScanner.Constants.BarCodeType.datamatrix:
        return 'Data Matrix';
      case BarCodeScanner.Constants.BarCodeType.codabar:
        return 'Codabar';
      case BarCodeScanner.Constants.BarCodeType.itf14:
        return 'ITF-14';
      default:
        return type.toUpperCase();
    }
  }

  static extractGiftCardInfo(barcodeData: string, barcodeType: string): Partial<{ brand: string; cardNumber: string }> {
    // This is a basic implementation - in a real app, you might want to integrate with
    // gift card APIs or have more sophisticated parsing logic
    
    const result: Partial<{ brand: string; cardNumber: string }> = {
      cardNumber: barcodeData
    };

    // Try to detect brand based on barcode patterns or prefixes
    if (barcodeType === BarCodeScanner.Constants.BarCodeType.qr && barcodeData.includes('starbucks')) {
      result.brand = 'Starbucks';
    } else if (barcodeData.startsWith('6006') || barcodeData.startsWith('6007')) {
      result.brand = 'Target';
    } else if (barcodeData.startsWith('6037') || barcodeData.startsWith('6038')) {
      result.brand = 'Walmart';
    } else if (barcodeData.startsWith('6035')) {
      result.brand = 'Best Buy';
    } else if (barcodeData.startsWith('6011')) {
      result.brand = 'Amazon';
    }

    return result;
  }
}