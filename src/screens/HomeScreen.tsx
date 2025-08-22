import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../types/navigation';
import { GiftCard } from '../types/giftCard';
import { StorageService } from '../services/storageService';
import { NotificationService } from '../services/notificationService';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [totalCards, setTotalCards] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [expiringCards, setExpiringCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    NotificationService.init();
  }, []);

  const loadDashboardData = async () => {
    try {
      const cards = await StorageService.getAllGiftCards();
      const activeCards = cards.filter(card => card.isActive);
      
      setTotalCards(activeCards.length);
      
      const balance = activeCards.reduce((sum, card) => sum + card.balance, 0);
      setTotalBalance(balance);
      
      const expiring = await StorageService.getExpiringCards(30);
      setExpiringCards(expiring);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanCard = () => {
    navigation.navigate('Scan');
  };

  const handleAddCard = () => {
    navigation.navigate('AddCard');
  };

  const handleViewCards = () => {
    navigation.navigate('Cards');
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#007AFF', '#0056CC']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Gift Card Manager</Text>
        <Text style={styles.headerSubtitle}>Manage your gift cards smartly</Text>
      </LinearGradient>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Icon name="credit-card" size={24} color="#007AFF" />
          <Text style={styles.summaryNumber}>{totalCards}</Text>
          <Text style={styles.summaryLabel}>Total Cards</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Icon name="account-balance-wallet" size={24} color="#34C759" />
          <Text style={styles.summaryNumber}>{formatCurrency(totalBalance)}</Text>
          <Text style={styles.summaryLabel}>Total Balance</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleScanCard}>
            <Icon name="qr-code-scanner" size={32} color="#007AFF" />
            <Text style={styles.actionButtonText}>Scan Card</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleAddCard}>
            <Icon name="add" size={32} color="#34C759" />
            <Text style={styles.actionButtonText}>Add Manually</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleViewCards}>
            <Icon name="list" size={32} color="#FF9500" />
            <Text style={styles.actionButtonText}>View All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expiring Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expiring Soon</Text>
        {expiringCards.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="check-circle" size={48} color="#34C759" />
            <Text style={styles.emptyStateText}>No cards expiring soon!</Text>
          </View>
        ) : (
          expiringCards.slice(0, 3).map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.expiringCard}
              onPress={() => navigation.navigate('CardDetail', { cardId: card.id })}
            >
              <View style={styles.expiringCardHeader}>
                <Text style={styles.expiringCardName}>{card.name}</Text>
                <Text style={styles.expiringCardBalance}>
                  {formatCurrency(card.balance)}
                </Text>
              </View>
              <View style={styles.expiringCardFooter}>
                <Text style={styles.expiringCardStore}>{card.store}</Text>
                <Text style={styles.expiringCardDays}>
                  {getDaysUntilExpiry(card.expirationDate)} days left
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        
        {expiringCards.length > 3 && (
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={handleViewCards}
          >
            <Text style={styles.viewMoreText}>View All Expiring Cards</Text>
            <Icon name="arrow-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  expiringCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expiringCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expiringCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  expiringCardBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  expiringCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiringCardStore: {
    fontSize: 14,
    color: '#8E8E93',
  },
  expiringCardDays: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  viewMoreText: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
  },
});

export default HomeScreen;