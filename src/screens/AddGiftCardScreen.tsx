import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  HelperText,
  Menu,
  Surface,
  IconButton,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { AddGiftCardScreenProps } from '../navigation/types';
import { DatabaseService } from '../services/database';
import { GiftCardFormData } from '../types/GiftCard';
import { useNotifications } from '../hooks/useNotifications';

const COMMON_BRANDS = [
  'Amazon', 'Apple', 'Best Buy', 'Google Play', 'iTunes', 'Netflix',
  'Spotify', 'Starbucks', 'Target', 'Walmart', 'Steam', 'PlayStation',
  'Xbox', 'Visa', 'Mastercard', 'Other'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

export const AddGiftCardScreen: React.FC<AddGiftCardScreenProps> = ({
  navigation,
  route,
}) => {
  const { barcode, barcodeType, brand } = route.params || {};
  const { scheduleNotificationsForCard } = useNotifications();

  const [formData, setFormData] = useState<GiftCardFormData>({
    name: '',
    brand: brand || '',
    balance: 0,
    originalAmount: 0,
    currency: 'USD',
    barcode: barcode || '',
    barcodeType: barcodeType || '',
    expirationDate: '',
    purchaseDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [brandMenuVisible, setBrandMenuVisible] = useState(false);
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);
  const [showExpirationPicker, setShowExpirationPicker] = useState(false);
  const [showPurchasePicker, setShowPurchasePicker] = useState(false);

  useEffect(() => {
    // Pre-fill form if coming from barcode scanner
    if (brand) {
      setFormData(prev => ({
        ...prev,
        name: `${brand} Gift Card`,
      }));
    }
  }, [brand]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }

    if (formData.balance < 0) {
      newErrors.balance = 'Balance cannot be negative';
    }

    if (formData.originalAmount < 0) {
      newErrors.originalAmount = 'Original amount cannot be negative';
    }

    if (formData.originalAmount > 0 && formData.balance > formData.originalAmount) {
      newErrors.balance = 'Balance cannot exceed original amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const cardId = await DatabaseService.addGiftCard(formData);
      
      // Schedule notifications for the new card if it has an expiration date
      if (formData.expirationDate) {
        const card = await DatabaseService.getGiftCardById(cardId);
        if (card) {
          await scheduleNotificationsForCard(card);
        }
      }

      Alert.alert(
        'Success',
        'Gift card has been added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving gift card:', error);
      Alert.alert('Error', 'Failed to save gift card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const openBarcodeScanner = () => {
    navigation.navigate('BarcodeScanner');
  };

  const updateFormData = (field: keyof GiftCardFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <Card.Content>
            <Title style={styles.formTitle}>Gift Card Details</Title>

            {/* Name */}
            <TextInput
              label="Card Name *"
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
            />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>

            {/* Brand */}
            <Menu
              visible={brandMenuVisible}
              onDismiss={() => setBrandMenuVisible(false)}
              anchor={
                <TextInput
                  label="Brand *"
                  value={formData.brand}
                  onChangeText={(text) => updateFormData('brand', text)}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.brand}
                  right={
                    <TextInput.Icon
                      icon="chevron-down"
                      onPress={() => setBrandMenuVisible(true)}
                    />
                  }
                />
              }
            >
              {COMMON_BRANDS.map((brandOption) => (
                <Menu.Item
                  key={brandOption}
                  onPress={() => {
                    updateFormData('brand', brandOption);
                    setBrandMenuVisible(false);
                  }}
                  title={brandOption}
                />
              ))}
            </Menu>
            <HelperText type="error" visible={!!errors.brand}>
              {errors.brand}
            </HelperText>

            {/* Balance and Currency */}
            <View style={styles.row}>
              <TextInput
                label="Current Balance *"
                value={formData.balance.toString()}
                onChangeText={(text) => {
                  const value = parseFloat(text) || 0;
                  updateFormData('balance', value);
                }}
                mode="outlined"
                style={[styles.input, styles.flex]}
                keyboardType="numeric"
                error={!!errors.balance}
              />
              <Menu
                visible={currencyMenuVisible}
                onDismiss={() => setCurrencyMenuVisible(false)}
                anchor={
                  <TextInput
                    label="Currency"
                    value={formData.currency}
                    mode="outlined"
                    style={[styles.input, styles.currencyInput]}
                    editable={false}
                    right={
                      <TextInput.Icon
                        icon="chevron-down"
                        onPress={() => setCurrencyMenuVisible(true)}
                      />
                    }
                  />
                }
              >
                {CURRENCIES.map((currency) => (
                  <Menu.Item
                    key={currency}
                    onPress={() => {
                      updateFormData('currency', currency);
                      setCurrencyMenuVisible(false);
                    }}
                    title={currency}
                  />
                ))}
              </Menu>
            </View>
            <HelperText type="error" visible={!!errors.balance}>
              {errors.balance}
            </HelperText>

            {/* Original Amount */}
            <TextInput
              label="Original Amount"
              value={formData.originalAmount.toString()}
              onChangeText={(text) => {
                const value = parseFloat(text) || 0;
                updateFormData('originalAmount', value);
              }}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              error={!!errors.originalAmount}
            />
            <HelperText type="error" visible={!!errors.originalAmount}>
              {errors.originalAmount}
            </HelperText>

            {/* Barcode */}
            <View style={styles.barcodeRow}>
              <TextInput
                label="Barcode"
                value={formData.barcode}
                onChangeText={(text) => updateFormData('barcode', text)}
                mode="outlined"
                style={[styles.input, styles.flex]}
                multiline={false}
              />
              <IconButton
                icon="qrcode-scan"
                size={24}
                onPress={openBarcodeScanner}
                style={styles.scanButton}
              />
            </View>

            {/* Barcode Type */}
            {formData.barcode && (
              <TextInput
                label="Barcode Type"
                value={formData.barcodeType}
                onChangeText={(text) => updateFormData('barcodeType', text)}
                mode="outlined"
                style={styles.input}
              />
            )}

            {/* Expiration Date */}
            <TextInput
              label="Expiration Date"
              value={formData.expirationDate}
              mode="outlined"
              style={styles.input}
              editable={false}
              right={
                <TextInput.Icon
                  icon="calendar"
                  onPress={() => setShowExpirationPicker(true)}
                />
              }
            />

            {/* Purchase Date */}
            <TextInput
              label="Purchase Date"
              value={formData.purchaseDate}
              mode="outlined"
              style={styles.input}
              editable={false}
              right={
                <TextInput.Icon
                  icon="calendar"
                  onPress={() => setShowPurchasePicker(true)}
                />
              }
            />

            {/* Notes */}
            <TextInput
              label="Notes"
              value={formData.notes}
              onChangeText={(text) => updateFormData('notes', text)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
            />
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={[styles.button, styles.cancelButton]}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={[styles.button, styles.saveButton]}
            loading={loading}
            disabled={loading}
          >
            Save Gift Card
          </Button>
        </View>
      </ScrollView>

      {/* Date Pickers */}
      {showExpirationPicker && (
        <DateTimePicker
          value={parseDate(formData.expirationDate) || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowExpirationPicker(false);
            if (selectedDate) {
              updateFormData('expirationDate', formatDate(selectedDate));
            }
          }}
        />
      )}

      {showPurchasePicker && (
        <DateTimePicker
          value={parseDate(formData.purchaseDate) || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPurchasePicker(false);
            if (selectedDate) {
              updateFormData('purchaseDate', formatDate(selectedDate));
            }
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    margin: 16,
    backgroundColor: '#fff',
  },
  formTitle: {
    marginBottom: 16,
    color: '#333',
  },
  input: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  currencyInput: {
    minWidth: 100,
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanButton: {
    backgroundColor: '#6200ea',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    margin: 16,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    borderColor: '#666',
  },
  saveButton: {
    backgroundColor: '#6200ea',
  },
});