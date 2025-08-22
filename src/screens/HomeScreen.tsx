import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Surface,
  Text,
  Chip,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreenProps } from '../navigation/types';
import { DatabaseService } from '../services/database';
import { GiftCard } from '../types/GiftCard';
import { useNotifications } from '../hooks/useNotifications';
import { format } from 'date-fns';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { hasPermission, scheduledCount, requestPermission, checkExpiringCards } = useNotifications();

  useEffect(() => {
    loadData();
    setupNotifications();
  }, []);

  const loadData = async () => {
    try {
      await DatabaseService.initialize();
      const cards = await DatabaseService.getAllGiftCards();
      setGiftCards(cards);
    } catch (error) {
      console.error('Error loading gift cards:', error);
      Alert.alert('Error', 'Failed to load gift cards');
    } finally {
      setLoading(false);
    }
  };

  const setupNotifications = async () => {
    try {
      if (!hasPermission) {
        await requestPermission();
      }
      await checkExpiringCards();
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await checkExpiringCards();
    setRefreshing(false);
  };

  const navigateToScanner = () => {
    navigation.navigate('BarcodeScanner');
  };

  const navigateToAddCard = () => {
    navigation.navigate('AddGiftCard', {});
  };

  const navigateToAllCards = () => {
    navigation.navigate('GiftCardList');
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const navigateToNotifications = () => {
    navigation.navigate('Notifications');
  };

  const navigateToCardDetail = (cardId: string) => {
    navigation.navigate('GiftCardDetail', { giftCardId: cardId });
  };

  // Calculate statistics
  const activeCards = giftCards.filter(card => !card.isExpired && card.balance > 0);
  const expiredCards = giftCards.filter(card => card.isExpired);
  const expiringCards = giftCards.filter(card => 
    !card.isExpired && 
    card.daysUntilExpiration !== undefined && 
    card.daysUntilExpiration <= 30 && 
    card.daysUntilExpiration >= 0
  );
  const totalBalance = activeCards.reduce((sum, card) => sum + card.balance, 0);

  const recentCards = giftCards
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Title style={styles.headerTitle}>Welcome Back!</Title>
            <Paragraph style={styles.headerSubtitle}>
              Manage your gift cards and never miss an expiration date
            </Paragraph>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="cog"
              size={24}
              onPress={navigateToSettings}
              iconColor="#6200ea"
            />
            <IconButton
              icon="bell"
              size={24}
              onPress={navigateToNotifications}
              iconColor="#6200ea"
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Surface style={styles.statCard} elevation={2}>
            <Text style={styles.statNumber}>{activeCards.length}</Text>
            <Text style={styles.statLabel}>Active Cards</Text>
          </Surface>
          <Surface style={styles.statCard} elevation={2}>
            <Text style={styles.statNumber}>${totalBalance.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Balance</Text>
          </Surface>
          <Surface style={styles.statCard} elevation={2}>
            <Text style={[styles.statNumber, expiringCards.length > 0 && styles.warningText]}>
              {expiringCards.length}
            </Text>
            <Text style={styles.statLabel}>Expiring Soon</Text>
          </Surface>
        </View>

        {/* Notifications Status */}
        {hasPermission && (
          <Card style={styles.notificationCard}>
            <Card.Content>
              <View style={styles.notificationContent}>
                <Ionicons name="notifications" size={24} color="#4caf50" />
                <View style={styles.notificationText}>
                  <Text style={styles.notificationTitle}>Notifications Active</Text>
                  <Text style={styles.notificationSubtitle}>
                    {scheduledCount} notifications scheduled
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Expiring Cards Alert */}
        {expiringCards.length > 0 && (
          <Card style={styles.alertCard}>
            <Card.Content>
              <View style={styles.alertContent}>
                <Ionicons name="warning" size={24} color="#ff9800" />
                <View style={styles.alertText}>
                  <Text style={styles.alertTitle}>Cards Expiring Soon</Text>
                  <Text style={styles.alertSubtitle}>
                    {expiringCards.length} card{expiringCards.length === 1 ? '' : 's'} expiring within 30 days
                  </Text>
                </View>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button onPress={navigateToAllCards}>View All</Button>
            </Card.Actions>
          </Card>
        )}

        {/* Recent Cards */}
        {recentCards.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Recent Cards</Title>
              <Button onPress={navigateToAllCards}>View All</Button>
            </View>
            {recentCards.map((card) => (
              <Card
                key={card.id}
                style={styles.cardItem}
                onPress={() => navigateToCardDetail(card.id)}
              >
                <Card.Content>
                  <View style={styles.cardContent}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardBrand}>{card.brand}</Text>
                      <Text style={styles.cardName}>{card.name}</Text>
                      <Text style={styles.cardBalance}>
                        {card.currency}{card.balance.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.cardStatus}>
                      {card.isExpired ? (
                        <Chip icon="alert-circle" mode="outlined" textStyle={styles.expiredChip}>
                          Expired
                        </Chip>
                      ) : card.daysUntilExpiration !== undefined && card.daysUntilExpiration <= 7 ? (
                        <Chip icon="clock-alert" mode="outlined" textStyle={styles.warningChip}>
                          {card.daysUntilExpiration}d left
                        </Chip>
                      ) : (
                        <Chip icon="check-circle" mode="outlined" textStyle={styles.activeChip}>
                          Active
                        </Chip>
                      )}
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="qrcode-scan"
              onPress={navigateToScanner}
              style={[styles.actionButton, styles.primaryButton]}
              contentStyle={styles.buttonContent}
            >
              Scan Card
            </Button>
            <Button
              mode="outlined"
              icon="plus"
              onPress={navigateToAddCard}
              style={styles.actionButton}
              contentStyle={styles.buttonContent}
            >
              Add Manually
            </Button>
          </View>
        </View>

        {/* Empty State */}
        {giftCards.length === 0 && !loading && (
          <Card style={styles.emptyState}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="gift" size={64} color="#ccc" />
              <Title style={styles.emptyTitle}>No Gift Cards Yet</Title>
              <Paragraph style={styles.emptySubtitle}>
                Start by scanning a gift card or adding one manually
              </Paragraph>
              <Button
                mode="contained"
                onPress={navigateToScanner}
                style={styles.emptyButton}
              >
                Scan Your First Card
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="qrcode-scan"
        onPress={navigateToScanner}
        label="Scan"
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    color: '#666',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  warningText: {
    color: '#ff9800',
  },
  notificationCard: {
    margin: 16,
    backgroundColor: '#e8f5e8',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
    marginLeft: 12,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#4caf50',
  },
  alertCard: {
    margin: 16,
    backgroundColor: '#fff3e0',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef6c00',
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#ff9800',
  },
  section: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  cardItem: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cardBalance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200ea',
    marginTop: 4,
  },
  cardStatus: {
    marginLeft: 12,
  },
  expiredChip: {
    color: '#d32f2f',
  },
  warningChip: {
    color: '#ff9800',
  },
  activeChip: {
    color: '#4caf50',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#6200ea',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  emptyState: {
    margin: 20,
    backgroundColor: '#fff',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    marginTop: 16,
    color: '#333',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#6200ea',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ea',
  },
});