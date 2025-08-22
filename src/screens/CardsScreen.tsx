import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../types/navigation';
import { GiftCard } from '../types/giftCard';
import { StorageService } from '../services/storageService';
import { NotificationService } from '../services/notificationService';

type CardsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

const CardsScreen: React.FC = () => {
  const navigation = useNavigation<CardsScreenNavigationProp>();
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<GiftCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'balance' | 'expiry'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Gift Card', 'Restaurant', 'Retail', 'Entertainment', 'Other'];

  useFocusEffect(
    React.useCallback(() => {
      loadCards();
    }, [])
  );

  const loadCards = async () => {
    try {
      const allCards = await StorageService.getAllGiftCards();
      setCards(allCards);
      applyFiltersAndSort(allCards, searchQuery, selectedCategory, sortBy, sortOrder);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  };

  const applyFiltersAndSort = (
    cardsToFilter: GiftCard[],
    query: string,
    category: string,
    sort: 'name' | 'balance' | 'expiry',
    order: 'asc' | 'desc'
  ) => {
    let filtered = cardsToFilter;

    // Apply search filter
    if (query.trim()) {
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(query.toLowerCase()) ||
        card.store.toLowerCase().includes(query.toLowerCase()) ||
        card.cardNumber.includes(query)
      );
    }

    // Apply category filter
    if (category !== 'All') {
      filtered = filtered.filter(card => card.category === category);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sort) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'balance':
          comparison = a.balance - b.balance;
          break;
        case 'expiry':
          const aExpiry = a.expirationDate ? new Date(a.expirationDate).getTime() : 0;
          const bExpiry = b.expirationDate ? new Date(b.expirationDate).getTime() : 0;
          comparison = aExpiry - bExpiry;
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    setFilteredCards(filtered);
  };

  useEffect(() => {
    applyFiltersAndSort(cards, searchQuery, selectedCategory, sortBy, sortOrder);
  }, [searchQuery, selectedCategory, sortBy, sortOrder, cards]);

  const handleCardPress = (card: GiftCard) => {
    navigation.navigate('CardDetail', { cardId: card.id });
  };

  const handleDeleteCard = async (card: GiftCard) => {
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
              await loadCards();
            } catch (error) {
              console.error('Error deleting card:', error);
              Alert.alert('Error', 'Failed to delete gift card. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (card: GiftCard) => {
    try {
      const updatedCard = { ...card, isActive: !card.isActive };
      await StorageService.saveGiftCard(updatedCard);
      
      if (updatedCard.isActive) {
        await NotificationService.scheduleExpiryNotification(updatedCard);
      } else {
        await NotificationService.cancelExpiryNotifications(card.id);
      }
      
      await loadCards();
    } catch (error) {
      console.error('Error toggling card status:', error);
      Alert.alert('Error', 'Failed to update gift card status. Please try again.');
    }
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

  const renderCard = ({ item }: { item: GiftCard }) => {
    const daysUntilExpiry = getDaysUntilExpiry(item.expirationDate);
    const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0;

    return (
      <TouchableOpacity
        style={[styles.card, !item.isActive && styles.inactiveCard]}
        onPress={() => handleCardPress(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cardStore} numberOfLines={1}>
              {item.store}
            </Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleActive(item)}
            >
              <Icon
                name={item.isActive ? 'visibility' : 'visibility-off'}
                size={20}
                color={item.isActive ? '#007AFF' : '#8E8E93'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteCard(item)}
            >
              <Icon name="delete" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Balance:</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.balance)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Card Number:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item.cardNumber}
            </Text>
          </View>

          {item.expirationDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expires:</Text>
              <Text
                style={[
                  styles.detailValue,
                  isExpired && styles.expiredText,
                  isExpiringSoon && styles.expiringSoonText,
                ]}
              >
                {item.expirationDate}
                {daysUntilExpiry !== null && (
                  <Text style={styles.daysText}>
                    {isExpired
                      ? ` (Expired ${Math.abs(daysUntilExpiry)} days ago)`
                      : isExpiringSoon
                      ? ` (${daysUntilExpiry} days left)`
                      : ` (${daysUntilExpiry} days left)`}
                  </Text>
                )}
              </Text>
            </View>
          )}

          {item.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes:</Text>
              <Text style={styles.detailValue} numberOfLines={2}>
                {item.notes}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardCategory}>{item.category}</Text>
          <Text style={styles.cardDate}>
            Added: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="credit-card" size={64} color="#8E8E93" />
      <Text style={styles.emptyStateTitle}>No Gift Cards Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery || selectedCategory !== 'All'
          ? 'Try adjusting your search or filters'
          : 'Start by adding your first gift card'}
      </Text>
      {!searchQuery && selectedCategory === 'All' && (
        <TouchableOpacity
          style={styles.addFirstButton}
          onPress={() => navigation.navigate('AddCard')}
        >
          <Text style={styles.addFirstButtonText}>Add Your First Card</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search gift cards..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              const newSortBy = sortBy === 'name' ? 'balance' : sortBy === 'balance' ? 'expiry' : 'name';
              setSortBy(newSortBy);
            }}
          >
            <Text style={styles.sortButtonText}>
              {sortBy === 'name' ? 'Name' : sortBy === 'balance' ? 'Balance' : 'Expiry'}
            </Text>
            <Icon name="arrow-drop-down" size={20} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.sortOrderButton}
            onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <Icon
              name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'}
              size={20}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cards List */}
      <FlatList
        data={filteredCards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddCard')}
      >
        <Icon name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    paddingVertical: 12,
  },
  filterRow: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 4,
  },
  sortOrderButton: {
    padding: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  cardStore: {
    fontSize: 14,
    color: '#8E8E93',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  cardDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    width: 80,
    marginRight: 12,
  },
  detailValue: {
    fontSize: 14,
    color: '#1C1C1E',
    flex: 1,
  },
  expiredText: {
    color: '#FF3B30',
  },
  expiringSoonText: {
    color: '#FF9500',
  },
  daysText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  cardCategory: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default CardsScreen;