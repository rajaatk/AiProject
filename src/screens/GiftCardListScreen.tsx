import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  FAB,
  Searchbar,
  Chip,
  Menu,
  Button,
  Text,
  Surface,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { GiftCardListScreenProps } from '../navigation/types';
import { DatabaseService } from '../services/database';
import { GiftCard } from '../types/GiftCard';
import { format } from 'date-fns';

type SortOption = 'name' | 'brand' | 'balance' | 'expiration' | 'created';
type FilterOption = 'all' | 'active' | 'expiring' | 'expired';

export const GiftCardListScreen: React.FC<GiftCardListScreenProps> = ({ navigation }) => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  useEffect(() => {
    loadGiftCards();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [giftCards, searchQuery, sortBy, filterBy]);

  const loadGiftCards = async () => {
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGiftCards();
    setRefreshing(false);
  }, []);

  const applyFiltersAndSort = () => {
    let filtered = [...giftCards];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(query) ||
        card.brand.toLowerCase().includes(query) ||
        card.notes?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    switch (filterBy) {
      case 'active':
        filtered = filtered.filter(card => !card.isExpired && card.balance > 0);
        break;
      case 'expiring':
        filtered = filtered.filter(card =>
          !card.isExpired &&
          card.daysUntilExpiration !== undefined &&
          card.daysUntilExpiration <= 30 &&
          card.daysUntilExpiration >= 0
        );
        break;
      case 'expired':
        filtered = filtered.filter(card => card.isExpired);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'brand':
          return a.brand.localeCompare(b.brand);
        case 'balance':
          return b.balance - a.balance;
        case 'expiration':
          if (!a.expirationDate && !b.expirationDate) return 0;
          if (!a.expirationDate) return 1;
          if (!b.expirationDate) return -1;
          return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredCards(filtered);
  };

  const navigateToDetail = (cardId: string) => {
    navigation.navigate('GiftCardDetail', { giftCardId: cardId });
  };

  const navigateToAdd = () => {
    navigation.navigate('AddGiftCard', {});
  };

  const navigateToScanner = () => {
    navigation.navigate('BarcodeScanner');
  };

  const deleteCard = async (card: GiftCard) => {
    Alert.alert(
      'Delete Gift Card',
      `Are you sure you want to delete "${card.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteGiftCard(card.id);
              await loadGiftCards();
            } catch (error) {
              console.error('Error deleting gift card:', error);
              Alert.alert('Error', 'Failed to delete gift card');
            }
          },
        },
      ]
    );
  };

  const renderGiftCard = ({ item }: { item: GiftCard }) => (
    <Card style={styles.cardItem} onPress={() => navigateToDetail(item.id)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardBrand}>{item.brand}</Text>
            <Text style={styles.cardName}>{item.name}</Text>
          </View>
          <View style={styles.cardActions}>
            <Text style={styles.cardBalance}>
              {item.currency}{item.balance.toFixed(2)}
            </Text>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => deleteCard(item)}
              iconColor="#d32f2f"
            />
          </View>
        </View>

        <View style={styles.cardDetails}>
          {item.expirationDate && (
            <Text style={styles.cardExpiration}>
              Expires: {format(item.expirationDate, 'MMM dd, yyyy')}
            </Text>
          )}
          {item.barcode && (
            <Text style={styles.cardBarcode}>
              {item.barcodeType}: {item.barcode}
            </Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardChips}>
            {item.isExpired ? (
              <Chip icon="alert-circle" mode="outlined" textStyle={styles.expiredChip}>
                Expired
              </Chip>
            ) : item.daysUntilExpiration !== undefined && item.daysUntilExpiration <= 7 ? (
              <Chip icon="clock-alert" mode="outlined" textStyle={styles.warningChip}>
                {item.daysUntilExpiration} days left
              </Chip>
            ) : (
              <Chip icon="check-circle" mode="outlined" textStyle={styles.activeChip}>
                Active
              </Chip>
            )}
          </View>
          <Text style={styles.cardDate}>
            Added {format(item.createdAt, 'MMM dd, yyyy')}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="gift-outline" size={64} color="#ccc" />
      <Title style={styles.emptyTitle}>
        {searchQuery || filterBy !== 'all' ? 'No matching cards' : 'No gift cards yet'}
      </Title>
      <Paragraph style={styles.emptySubtitle}>
        {searchQuery || filterBy !== 'all'
          ? 'Try adjusting your search or filter'
          : 'Start by scanning a gift card or adding one manually'}
      </Paragraph>
      {!searchQuery && filterBy === 'all' && (
        <Button
          mode="contained"
          onPress={navigateToScanner}
          style={styles.emptyButton}
        >
          Scan Your First Card
        </Button>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <Surface style={styles.toolbar} elevation={2}>
        <Searchbar
          placeholder="Search gift cards..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <View style={styles.filterRow}>
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setFilterMenuVisible(true)}
                icon="filter"
                compact
              >
                {filterBy === 'all' ? 'All' : 
                 filterBy === 'active' ? 'Active' :
                 filterBy === 'expiring' ? 'Expiring' : 'Expired'}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setFilterBy('all'); setFilterMenuVisible(false); }} title="All Cards" />
            <Menu.Item onPress={() => { setFilterBy('active'); setFilterMenuVisible(false); }} title="Active" />
            <Menu.Item onPress={() => { setFilterBy('expiring'); setFilterMenuVisible(false); }} title="Expiring Soon" />
            <Menu.Item onPress={() => { setFilterBy('expired'); setFilterMenuVisible(false); }} title="Expired" />
          </Menu>

          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setSortMenuVisible(true)}
                icon="sort"
                compact
              >
                Sort
              </Button>
            }
          >
            <Menu.Item onPress={() => { setSortBy('created'); setSortMenuVisible(false); }} title="Date Added" />
            <Menu.Item onPress={() => { setSortBy('name'); setSortMenuVisible(false); }} title="Name" />
            <Menu.Item onPress={() => { setSortBy('brand'); setSortMenuVisible(false); }} title="Brand" />
            <Menu.Item onPress={() => { setSortBy('balance'); setSortMenuVisible(false); }} title="Balance" />
            <Menu.Item onPress={() => { setSortBy('expiration'); setSortMenuVisible(false); }} title="Expiration" />
          </Menu>
        </View>
      </Surface>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredCards.length} card{filteredCards.length === 1 ? '' : 's'}
        </Text>
      </View>

      {/* Gift Cards List */}
      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.id}
        renderItem={renderGiftCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={navigateToAdd}
        label="Add Card"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchbar: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  cardItem: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  cardActions: {
    alignItems: 'flex-end',
  },
  cardBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ea',
    marginBottom: 4,
  },
  cardDetails: {
    marginBottom: 12,
  },
  cardExpiration: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  cardBarcode: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChips: {
    flexDirection: 'row',
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    color: '#333',
    textAlign: 'center',
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