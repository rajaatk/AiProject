import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Card,
  Title,
  List,
  Switch,
  Button,
  Text,
} from 'react-native-paper';
import { SettingsScreenProps } from '../navigation/types';
import { useNotifications } from '../hooks/useNotifications';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { 
    hasPermission, 
    scheduledCount, 
    requestPermission, 
    sendTestNotification,
    refreshAllNotifications 
  } = useNotifications();

  const handleNotificationPermission = async () => {
    if (!hasPermission) {
      await requestPermission();
    }
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
  };

  const handleRefreshNotifications = async () => {
    await refreshAllNotifications();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Notifications Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Notifications</Title>
            
            <List.Item
              title="Notification Permission"
              description={hasPermission ? 'Enabled' : 'Disabled'}
              left={props => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={hasPermission || false}
                  onValueChange={handleNotificationPermission}
                  disabled={hasPermission || false}
                />
              )}
            />

            {hasPermission && (
              <List.Item
                title="Scheduled Notifications"
                description={`${scheduledCount} notifications scheduled`}
                left={props => <List.Icon {...props} icon="clock" />}
              />
            )}

            <View style={styles.buttonGroup}>
              <Button
                mode="outlined"
                onPress={handleTestNotification}
                style={styles.button}
                disabled={!hasPermission}
              >
                Test Notification
              </Button>
              <Button
                mode="outlined"
                onPress={handleRefreshNotifications}
                style={styles.button}
                disabled={!hasPermission}
              >
                Refresh All
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* App Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>About</Title>
            
            <List.Item
              title="Version"
              description="1.0.0"
              left={props => <List.Icon {...props} icon="information" />}
            />
            
            <List.Item
              title="Developer"
              description="Gift Card Scanner App"
              left={props => <List.Icon {...props} icon="account" />}
            />

            <Text style={styles.description}>
              Gift Card Scanner helps you manage all your gift cards in one place. 
              Scan barcodes, track balances, and get notified before they expire.
            </Text>
          </Card.Content>
        </Card>

        {/* Help & Support */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Help & Support</Title>
            
            <List.Item
              title="How to scan gift cards"
              description="Tap the scan button and point your camera at the barcode"
              left={props => <List.Icon {...props} icon="help-circle" />}
            />
            
            <List.Item
              title="Managing notifications"
              description="Enable notifications to get alerts before cards expire"
              left={props => <List.Icon {...props} icon="help-circle" />}
            />
            
            <List.Item
              title="Editing card details"
              description="Tap on any gift card to view and edit its information"
              left={props => <List.Icon {...props} icon="help-circle" />}
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
  card: {
    margin: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 12,
  },
});