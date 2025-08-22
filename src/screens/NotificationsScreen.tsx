import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  List,
  Chip,
  Button,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { NotificationsScreenProps } from '../navigation/types';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationService } from '../services/notificationService';
import { format } from 'date-fns';

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { 
    hasPermission, 
    scheduledCount, 
    requestPermission,
    refreshAllNotifications,
    updateScheduledCount 
  } = useNotifications();
  
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const notifications = await NotificationService.getScheduledNotifications();
      const giftCardNotifications = notifications.filter(notification =>
        notification.identifier.startsWith('giftcard_')
      );
      setScheduledNotifications(giftCardNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    await updateScheduledCount();
    setRefreshing(false);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      await refreshAllNotifications();
      await loadNotifications();
    }
  };

  const handleRefreshAll = async () => {
    await refreshAllNotifications();
    await loadNotifications();
  };

  const formatNotificationTime = (trigger: any): string => {
    if (trigger?.date) {
      return format(new Date(trigger.date), 'MMM dd, yyyy at h:mm a');
    }
    return 'Unknown';
  };

  const getNotificationIcon = (identifier: string): string => {
    if (identifier.includes('1days')) return 'alert-circle';
    if (identifier.includes('3days')) return 'clock-alert';
    if (identifier.includes('7days')) return 'calendar-clock';
    if (identifier.includes('30days')) return 'calendar';
    return 'bell';
  };

  const getNotificationColor = (identifier: string): string => {
    if (identifier.includes('1days')) return '#d32f2f';
    if (identifier.includes('3days')) return '#ff9800';
    if (identifier.includes('7days')) return '#ff9800';
    if (identifier.includes('30days')) return '#4caf50';
    return '#6200ea';
  };

  const getDaysFromIdentifier = (identifier: string): string => {
    if (identifier.includes('1days')) return '1 day';
    if (identifier.includes('3days')) return '3 days';
    if (identifier.includes('7days')) return '7 days';
    if (identifier.includes('30days')) return '30 days';
    return 'Unknown';
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Card style={styles.permissionCard}>
            <Card.Content style={styles.permissionContent}>
              <Ionicons name="notifications-off" size={64} color="#ccc" />
              <Title style={styles.permissionTitle}>Notifications Disabled</Title>
              <Text style={styles.permissionText}>
                Enable notifications to get alerts when your gift cards are about to expire.
              </Text>
              <Button
                mode="contained"
                onPress={handleEnableNotifications}
                style={styles.enableButton}
              >
                Enable Notifications
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
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
        {/* Status Card */}
        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.statusContent}>
              <Ionicons name="notifications" size={32} color="#4caf50" />
              <View style={styles.statusText}>
                <Title style={styles.statusTitle}>Notifications Active</Title>
                <Text style={styles.statusSubtitle}>
                  {scheduledCount} notifications scheduled
                </Text>
              </View>
            </View>
            <Button
              mode="outlined"
              onPress={handleRefreshAll}
              style={styles.refreshButton}
            >
              Refresh All Notifications
            </Button>
          </Card.Content>
        </Card>

        {/* Scheduled Notifications */}
        <Card style={styles.notificationsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Scheduled Notifications</Title>
            
            {scheduledNotifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="bell-off" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No notifications scheduled</Text>
                <Text style={styles.emptySubtext}>
                  Add gift cards with expiration dates to get notifications
                </Text>
              </View>
            ) : (
              scheduledNotifications.map((notification, index) => (
                <List.Item
                  key={notification.identifier}
                  title={notification.content.title}
                  description={notification.content.body}
                  left={() => (
                    <View style={styles.notificationIcon}>
                      <Ionicons
                        name={getNotificationIcon(notification.identifier)}
                        size={24}
                        color={getNotificationColor(notification.identifier)}
                      />
                    </View>
                  )}
                  right={() => (
                    <View style={styles.notificationMeta}>
                      <Chip
                        mode="outlined"
                        textStyle={{ 
                          color: getNotificationColor(notification.identifier),
                          fontSize: 12 
                        }}
                        style={{ 
                          borderColor: getNotificationColor(notification.identifier),
                          marginBottom: 4
                        }}
                      >
                        {getDaysFromIdentifier(notification.identifier)} before
                      </Chip>
                      <Text style={styles.notificationTime}>
                        {formatNotificationTime(notification.trigger)}
                      </Text>
                    </View>
                  )}
                  style={styles.notificationItem}
                />
              ))
            )}
          </Card.Content>
        </Card>

        {/* Information Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>About Notifications</Title>
            
            <List.Item
              title="Automatic Scheduling"
              description="Notifications are automatically scheduled when you add gift cards with expiration dates"
              left={props => <List.Icon {...props} icon="clock-check" />}
            />
            
            <List.Item
              title="Notification Timing"
              description="You'll receive alerts 30, 7, 3, and 1 day(s) before expiration"
              left={props => <List.Icon {...props} icon="calendar-alert" />}
            />
            
            <List.Item
              title="Managing Notifications"
              description="Edit or delete gift cards to update their notification schedules"
              left={props => <List.Icon {...props} icon="cog" />}
            />
          </Card.Content>
        </Card>
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
  permissionCard: {
    margin: 16,
    backgroundColor: '#fff',
  },
  permissionContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  permissionTitle: {
    marginTop: 16,
    color: '#333',
    textAlign: 'center',
  },
  permissionText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  enableButton: {
    backgroundColor: '#6200ea',
  },
  statusCard: {
    margin: 16,
    backgroundColor: '#e8f5e8',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    color: '#2e7d32',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#4caf50',
    marginTop: 4,
  },
  refreshButton: {
    borderColor: '#4caf50',
  },
  notificationsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#333',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  notificationItem: {
    paddingVertical: 8,
  },
  notificationIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  notificationMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
});