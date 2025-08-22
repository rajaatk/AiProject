import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Share,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Surface,
  Text,
  IconButton,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { GiftCardDetailScreenProps } from '../navigation/types';
import { DatabaseService } from '../services/database';
import { GiftCard } from '../types/GiftCard';
import { useNotifications } from '../hooks/useNotifications';
import { format, formatDistanceToNow } from 'date-fns';

export const GiftCardDetailScreen: React.FC<GiftCardDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { giftCardId } = route.params;
  const { cancelNotificationsForCard } = useNotifications();
  
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGiftCard();
  }, [giftCardId]);

  const loadGiftCard = async () => {
    try {
      const card = await DatabaseService.getGiftCardById(giftCardId);
      setGiftCard(card);
    } catch (error) {
      console.error('Error loading gift card:', error);
      Alert.alert('Error', 'Failed to load gift card details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGiftCard();
    setRefreshing(false);
  };

  const handleEdit = () => {
    if (giftCard) {
      navigation.navigate('EditGiftCard', { giftCard });
    }
  };

  const handleDelete = () => {
    if (!giftCard) return;

    Alert.alert(
      'Delete Gift Card',
      `Are you sure you want to delete "${giftCard.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteGiftCard(giftCard.id);
              await cancelNotificationsForCard(giftCard.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting gift card:', error);
              Alert.alert('Error', 'Failed to delete gift card');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!giftCard) return;

    const shareContent = `Gift Card: ${giftCard.brand} - ${giftCard.name}
Balance: ${giftCard.currency}${giftCard.balance.toFixed(2)}
${giftCard.barcode ? `Barcode: ${giftCard.barcode}` : ''}
${giftCard.expirationDate ? `Expires: ${format(giftCard.expirationDate, 'MMM dd, yyyy')}` : ''}`;

    try {
      await Share.share({
        message: shareContent,
        title: 'Gift Card Details',
      });
    } catch (error) {
      console.error('Error sharing gift card:', error);
    }
  };

  const getStatusColor = (card: GiftCard): string => {
    if (card.isExpired) return '#d32f2f';
    if (card.daysUntilExpiration !== undefined && card.daysUntilExpiration <= 7) return '#ff9800';
    return '#4caf50';
  };

  const getStatusText = (card: GiftCard): string => {
    if (card.isExpired) return 'Expired';
    if (card.daysUntilExpiration !== undefined && card.daysUntilExpiration <= 7) {
      return `${card.daysUntilExpiration} days left`;
    }
    return 'Active';
  };

  if (loading || !giftCard) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <View style={styles.headerInfo}>
                <Title style={styles.cardTitle}>{giftCard.name}</Title>
                <Paragraph style={styles.cardBrand}>{giftCard.brand}</Paragraph>
                <Text style={styles.cardBalance}>
                  {giftCard.currency}{giftCard.balance.toFixed(2)}
                </Text>
              </View>
              <View style={styles.headerActions}>
                <IconButton
                  icon="share-variant"
                  size={24}
                  onPress={handleShare}
                  iconColor="#6200ea"
                />
                <IconButton
                  icon="pencil"
                  size={24}
                  onPress={handleEdit}
                  iconColor="#6200ea"
                />
                <IconButton
                  icon="delete"
                  size={24}
                  onPress={handleDelete}
                  iconColor="#d32f2f"
                />
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.statusRow}>
              <Chip
                icon={giftCard.isExpired ? 'alert-circle' : 'check-circle'}
                mode="outlined"
                textStyle={{ color: getStatusColor(giftCard) }}
                style={{ borderColor: getStatusColor(giftCard) }}
              >
                {getStatusText(giftCard)}
              </Chip>
              {giftCard.balance === 0 && (
                <Chip
                  icon="credit-card-off"
                  mode="outlined"
                  textStyle={{ color: '#666' }}
                  style={{ borderColor: '#666' }}
                >
                  Empty
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Details Card */}
        <Card style={styles.detailCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Details</Title>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Original Amount:</Text>
              <Text style={styles.detailValue}>
                {giftCard.currency}{giftCard.originalAmount.toFixed(2)}
              </Text>
            </View>

            {giftCard.expirationDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Expires:</Text>
                <Text style={[
                  styles.detailValue,
                  giftCard.isExpired && styles.expiredText
                ]}>
                  {format(giftCard.expirationDate, 'MMM dd, yyyy')}
                  {giftCard.daysUntilExpiration !== undefined && (
                    <Text style={styles.daysLeft}>
                      {' '}({giftCard.daysUntilExpiration > 0 
                        ? `${giftCard.daysUntilExpiration} days left`
                        : giftCard.daysUntilExpiration === 0 
                          ? 'Expires today'
                          : 'Expired'
                      })
                    </Text>
                  )}
                </Text>
              </View>
            )}

            {giftCard.purchaseDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Purchased:</Text>
                <Text style={styles.detailValue}>
                  {format(giftCard.purchaseDate, 'MMM dd, yyyy')}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Added:</Text>
              <Text style={styles.detailValue}>
                {format(giftCard.createdAt, 'MMM dd, yyyy')}
                <Text style={styles.timeAgo}>
                  {' '}({formatDistanceToNow(giftCard.createdAt, { addSuffix: true })})
                </Text>
              </Text>
            </View>

            {giftCard.updatedAt.getTime() !== giftCard.createdAt.getTime() && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Updated:</Text>
                <Text style={styles.detailValue}>
                  {format(giftCard.updatedAt, 'MMM dd, yyyy')}
                  <Text style={styles.timeAgo}>
                    {' '}({formatDistanceToNow(giftCard.updatedAt, { addSuffix: true })})
                  </Text>
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Barcode Card */}
        {giftCard.barcode && (
          <Card style={styles.barcodeCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Barcode</Title>
              <Surface style={styles.barcodeSurface} elevation={1}>
                <Text style={styles.barcodeType}>{giftCard.barcodeType}</Text>
                <Text style={styles.barcodeValue}>{giftCard.barcode}</Text>
              </Surface>
            </Card.Content>
          </Card>
        )}

        {/* Notes Card */}
        {giftCard.notes && (
          <Card style={styles.notesCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Notes</Title>
              <Text style={styles.notesText}>{giftCard.notes}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Usage Tracking */}
        {giftCard.originalAmount > 0 && (
          <Card style={styles.usageCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Usage</Title>
              <View style={styles.usageRow}>
                <Text style={styles.usageLabel}>Remaining:</Text>
                <Text style={styles.usageValue}>
                  {((giftCard.balance / giftCard.originalAmount) * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.usageRow}>
                <Text style={styles.usageLabel}>Used:</Text>
                <Text style={styles.usageValue}>
                  {giftCard.currency}{(giftCard.originalAmount - giftCard.balance).toFixed(2)}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(giftCard.balance / giftCard.originalAmount) * 100}%`,
                      backgroundColor: giftCard.balance > 0 ? '#4caf50' : '#d32f2f',
                    },
                  ]}
                />
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={handleEdit}
            style={styles.actionButton}
          >
            Edit Card
          </Button>
          <Button
            mode="outlined"
            icon="delete"
            onPress={handleDelete}
            style={styles.actionButton}
            textColor="#d32f2f"
          >
            Delete Card
          </Button>
        </View>
      </ScrollView>
    </View>
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
  headerCard: {
    margin: 16,
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cardBrand: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  cardBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ea',
    marginTop: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  divider: {
    marginVertical: 16,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  expiredText: {
    color: '#d32f2f',
  },
  daysLeft: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'normal',
  },
  timeAgo: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'normal',
  },
  barcodeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  barcodeSurface: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  barcodeType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  barcodeValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: '#333',
    fontWeight: '600',
  },
  notesCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  usageCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 16,
    color: '#666',
  },
  usageValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    margin: 16,
  },
  actionButton: {
    flex: 1,
  },
});