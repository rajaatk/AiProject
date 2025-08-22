import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DatePicker from 'react-native-date-picker';
import { RootStackParamList } from '../types/navigation';
import { GiftCard, GiftCardFormData } from '../types/giftCard';
import { StorageService } from '../services/storageService';
import { NotificationService } from '../services/notificationService';

type AddCardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddCard'>;
type AddCardScreenRouteProp = RouteProp<RootStackParamList, 'AddCard'>;

const AddCardScreen: React.FC = () => {
  const navigation = useNavigation<AddCardScreenNavigationProp>();
  const route = useRoute<AddCardScreenRouteProp>();
  const scannedData = route.params?.scannedData;

  const [formData, setFormData] = useState<GiftCardFormData>({
    name: '',
    cardNumber: '',
    balance: 0,
    currency: 'USD',
    expirationDate: '',
    store: '',
    category: 'Gift Card',
    notes: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scannedData) {
      setFormData(prev => ({
        ...prev,
        ...scannedData,
      }));
    }
  }, [scannedData]);

  const handleInputChange = (field: keyof GiftCardFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (date: Date) => {
    setFormData(prev => ({
      ...prev,
      expirationDate: date.toISOString().split('T')[0],
    }));
    setShowDatePicker(false);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a card name');
      return false;
    }
    if (!formData.cardNumber.trim()) {
      Alert.alert('Error', 'Please enter a card number');
      return false;
    }
    if (!formData.store.trim()) {
      Alert.alert('Error', 'Please enter a store name');
      return false;
    }
    if (formData.balance < 0) {
      Alert.alert('Error', 'Balance cannot be negative');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newCard: GiftCard = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await StorageService.saveGiftCard(newCard);
      await NotificationService.scheduleExpiryNotification(newCard);

      Alert.alert(
        'Success',
        'Gift card saved successfully!',
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

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Icon name="add-card" size={48} color="#007AFF" />
          <Text style={styles.headerTitle}>
            {scannedData ? 'Complete Gift Card' : 'Add New Gift Card'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {scannedData ? 'Review and complete the scanned information' : 'Enter your gift card details'}
          </Text>
        </View>

        <View style={styles.form}>
          {/* Card Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="e.g., Starbucks Gift Card"
              placeholderTextColor="#8E8E93"
            />
          </View>

          {/* Card Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.cardNumber}
              onChangeText={(value) => handleInputChange('cardNumber', value)}
              placeholder="Enter card number or code"
              placeholderTextColor="#8E8E93"
            />
          </View>

          {/* Balance and Currency */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex2]}>
              <Text style={styles.label}>Balance</Text>
              <TextInput
                style={styles.input}
                value={formData.balance.toString()}
                onChangeText={(value) => handleInputChange('balance', parseFloat(value) || 0)}
                placeholder="0.00"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Currency</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    // Simple currency picker - could be expanded
                    Alert.alert(
                      'Select Currency',
                      'Choose your currency',
                      [
                        { text: 'USD', onPress: () => handleInputChange('currency', 'USD') },
                        { text: 'EUR', onPress: () => handleInputChange('currency', 'EUR') },
                        { text: 'GBP', onPress: () => handleInputChange('currency', 'GBP') },
                        { text: 'Cancel', style: 'cancel' },
                      ]
                    );
                  }}
                >
                  <Text style={styles.pickerButtonText}>{formData.currency}</Text>
                  <Icon name="arrow-drop-down" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Store */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store/Merchant *</Text>
            <TextInput
              style={styles.input}
              value={formData.store}
              onChangeText={(value) => handleInputChange('store', value)}
              placeholder="e.g., Starbucks, Amazon, Target"
              placeholderTextColor="#8E8E93"
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  Alert.alert(
                    'Select Category',
                    'Choose a category',
                    [
                      { text: 'Gift Card', onPress: () => handleInputChange('category', 'Gift Card') },
                      { text: 'Restaurant', onPress: () => handleInputChange('category', 'Restaurant') },
                      { text: 'Retail', onPress: () => handleInputChange('category', 'Retail') },
                      { text: 'Entertainment', onPress: () => handleInputChange('category', 'Entertainment') },
                      { text: 'Other', onPress: () => handleInputChange('category', 'Other') },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }}
              >
                <Text style={styles.pickerButtonText}>{formData.category}</Text>
                <Icon name="arrow-drop-down" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Expiration Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expiration Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {formData.expirationDate || 'Select Date'}
              </Text>
              <Icon name="calendar-today" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              placeholder="Add any additional notes..."
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Gift Card'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DatePicker
        modal
        open={showDatePicker}
        date={formData.expirationDate ? new Date(formData.expirationDate) : new Date()}
        mode="date"
        onConfirm={handleDateChange}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  textArea: {
    height: 80,
    paddingTop: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddCardScreen;