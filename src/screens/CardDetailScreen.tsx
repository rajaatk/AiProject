import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DatePicker from 'react-native-date-picker';
import { RootStackParamList } from '../types/navigation';
import { GiftCard, GiftCardFormData } from '../types/giftCard';
import { StorageService } from '../services/storageService';
import { NotificationService } from '../services/notificationService';

type CardDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CardDetail'>;
type CardDetailScreenRouteProp = RouteProp<RootStackParamList, 'CardDetail'>;

const CardDetailScreen: React.FC = () => {
  const navigation = useNavigation<CardDetailScreenNavigationProp>();
  const route = useRoute<CardDetailScreenRouteProp>();
  const { cardId } = route.params;

  const [card, setCard] = useState<GiftCard | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<GiftCardFormData>({
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCard();
  }, [cardId]);

  const loadCard = async () => {
    try {
      const cardData = await StorageService.getGiftCardById(cardId);
      if (cardData) {
        setCard(cardData);
        setEditData({
          name: cardData.name,
          cardNumber: cardData.cardNumber,
          balance: cardData.balance,
          currency: cardData.currency,
          expirationDate: cardData.expirationDate,
          store: cardData.store,
          category: cardData.category,
          notes: cardData.notes || '',
        });
      } else {
        Alert.alert('Error', 'Gift card not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading card:', error);
      Alert.alert('Error', 'Failed to load gift card');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof GiftCardFormData, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (date: Date) => {
    setEditData(prev => ({
      ...prev,
      expirationDate: date.toISOString().split('T')[0],
    }));
    setShowDatePicker(false);
  };

  const handleSave = async () => {
    if (!card) return;

    setSaving(true);
    try {
      const updatedCard: GiftCard = {
        ...card,
        ...editData,
        updatedAt: new Date().toISOString(),
      };

      await StorageService.saveGiftCard(updatedCard);
      
      // Update notifications
      if (updatedCard.isActive) {
        await NotificationService.scheduleExpiryNotification(updatedCard);
      } else {
        await NotificationService.cancelExpiryNotifications(card.id);
      }

      setCard(updatedCard);
      setIsEditing(false);
      Alert.alert('Success', 'Gift card updated successfully!');
    } catch (error) {
      console.error('Error updating card:', error);
      Alert.alert('Error', 'Failed to update gift card. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!card) return;

    Alert.alert(
      'Delete Gift Card',
      `Are you sure you want to delete "${card.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteGiftCard(card.id);
              await NotificationService.cancelExpiryNotifications(card.id);
              Alert.alert('Success', 'Gift card deleted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Error deleting card:', error);
              Alert.alert('Error', 'Failed to delete gift card. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = () => {
    if (!card?.expirationDate) return { status: 'no-expiry', text: 'No expiration date' };
    
    const daysUntilExpiry = getDaysUntilExpiry(card.expirationDate);
    if (daysUntilExpiry === null) return { status: 'no-expiry', text: 'No expiration date' };
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', text: `Expired ${Math.abs(daysUntilExpiry)} days ago` };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'critical', text: `${daysUntilExpiry} days left` };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'warning', text: `${daysUntilExpiry} days left` };
    } else {
      return { status: 'safe', text: `${daysUntilExpiry} days left` };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.errorContainer}>
        <Text>Gift card not found</Text>
      </View>
    );
  }

  const expiryStatus = getExpiryStatus();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Icon name="credit-card" size={48} color="#007AFF" />
            <Text style={styles.cardName}>{card.name}</Text>
            <Text style={styles.cardStore}>{card.store}</Text>
            
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, card.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                <Text style={[styles.statusText, card.isActive ? styles.activeText : styles.inactiveText]}>
                  {card.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
              
              {card.expirationDate && (
                <View style={[styles.expiryBadge, styles[`${expiryStatus.status}Badge`]]}>
                  <Text style={[styles.expiryText, styles[`${expiryStatus.status}ExpiryText`]]}>
                    {expiryStatus.text}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Card Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Icon name={isEditing ? 'close' : 'edit'} size={20} color="#007AFF" />
              <Text style={styles.editButtonText}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Card Name</Text>
                <TextInput
                  style={styles.input}
                  value={editData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Card name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={editData.cardNumber}
                  onChangeText={(value) => handleInputChange('cardNumber', value)}
                  placeholder="Card number"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex2]}>
                  <Text style={styles.label}>Balance</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.balance.toString()}
                    onChangeText={(value) => handleInputChange('balance', parseFloat(value) || 0)}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Currency</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
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
                    <Text style={styles.pickerButtonText}>{editData.currency}</Text>
                    <Icon name="arrow-drop-down" size={20} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Store</Text>
                <TextInput
                  style={styles.input}
                  value={editData.store}
                  onChangeText={(value) => handleInputChange('store', value)}
                  placeholder="Store name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
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
                  <Text style={styles.pickerButtonText}>{editData.category}</Text>
                  <Icon name="arrow-drop-down" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Expiration Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {editData.expirationDate || 'Select Date'}
                  </Text>
                  <Icon name="calendar-today" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editData.notes}
                  onChangeText={(value) => handleInputChange('notes', value)}
                  placeholder="Add notes..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Balance</Text>
                <Text style={styles.detailValue}>{formatCurrency(card.balance)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Card Number</Text>
                <Text style={styles.detailValue}>{card.cardNumber}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{card.category}</Text>
              </View>
              
              {card.expirationDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Expiration</Text>
                  <Text style={styles.detailValue}>{card.expirationDate}</Text>
                </View>
              )}
              
              {card.notes && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={styles.detailValue}>{card.notes}</Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Added</Text>
                <Text style={styles.detailValue}>
                  {new Date(card.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Updated</Text>
                <Text style={styles.detailValue}>
                  {new Date(card.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Icon name="delete" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Delete Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <DatePicker
        modal
        open={showDatePicker}
        date={editData.expirationDate ? new Date(editData.expirationDate) : new Date()}
        mode="date"
        onConfirm={handleDateChange}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerContent: {
    alignItems: 'center',
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardStore: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  inactiveBadge: {
    backgroundColor: '#F2F2F7',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeText: {
    color: '#34C759',
  },
  inactiveText: {
    color: '#8E8E93',
  },
  expiryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  noExpiryBadge: {
    backgroundColor: '#F2F2F7',
  },
  safeBadge: {
    backgroundColor: '#E8F5E8',
  },
  warningBadge: {
    backgroundColor: '#FFF3E0',
  },
  criticalBadge: {
    backgroundColor: '#FFEBEE',
  },
  expiredBadge: {
    backgroundColor: '#FFEBEE',
  },
  expiryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noExpiryExpiryText: {
    color: '#8E8E93',
  },
  safeExpiryText: {
    color: '#34C759',
  },
  warningExpiryText: {
    color: '#FF9500',
  },
  criticalExpiryText: {
    color: '#FF3B30',
  },
  expiredExpiryText: {
    color: '#FF3B30',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 4,
  },
  editForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  detailsList: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CardDetailScreen;