import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StorageService } from '../services/storageService';
import { NotificationService } from '../services/notificationService';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    notifications: {
      enabled: true,
      daysBeforeExpiry: [7, 3, 1],
      reminderTime: '09:00',
    },
    currency: 'USD',
    theme: 'light',
    language: 'en',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await StorageService.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await StorageService.saveSettings(newSettings);
      setSettings(newSettings);
      
      // Update notifications if settings changed
      if (newSettings.notifications.enabled !== settings.notifications.enabled) {
        if (newSettings.notifications.enabled) {
          await NotificationService.scheduleAllExpiryNotifications();
        } else {
          await NotificationService.cancelAllNotifications();
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleNotificationToggle = (value: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        enabled: value,
      },
    };
    saveSettings(newSettings);
  };

  const handleDaysBeforeExpiryChange = (days: number) => {
    const newDays = settings.notifications.daysBeforeExpiry.includes(days)
      ? settings.notifications.daysBeforeExpiry.filter(d => d !== days)
      : [...settings.notifications.daysBeforeExpiry, days].sort((a, b) => b - a);

    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        daysBeforeExpiry: newDays,
      },
    };
    saveSettings(newSettings);
  };

  const handleReminderTimeChange = (time: string) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        reminderTime: time,
      },
    };
    saveSettings(newSettings);
  };

  const handleCurrencyChange = (currency: string) => {
    const newSettings = {
      ...settings,
      currency,
    };
    saveSettings(newSettings);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    const newSettings = {
      ...settings,
      theme,
    };
    saveSettings(newSettings);
  };

  const handleLanguageChange = (language: string) => {
    const newSettings = {
      ...settings,
      language,
    };
    saveSettings(newSettings);
  };

  const handleExportData = async () => {
    try {
      const cards = await StorageService.getAllGiftCards();
      const exportData = {
        exportDate: new Date().toISOString(),
        totalCards: cards.length,
        cards: cards,
        settings: settings,
      };
      
      // In a real app, you would save this to a file or share it
      console.log('Export data:', JSON.stringify(exportData, null, 2));
      Alert.alert(
        'Export Successful',
        'Your gift card data has been prepared for export. Check the console for the data.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your gift cards and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.cancelAllNotifications();
              // Clear all data from storage
              // In a real app, you would implement this
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    rightElement?: React.ReactNode
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Icon name={icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement && <View style={styles.settingRight}>{rightElement}</View>}
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="settings" size={48} color="#007AFF" />
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your gift card manager</Text>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        {renderSettingItem(
          'notifications',
          'Enable Notifications',
          'Get reminders about expiring gift cards',
          <Switch
            value={settings.notifications.enabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
            thumbColor="#FFFFFF"
          />
        )}

        {settings.notifications.enabled && (
          <>
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Reminder Schedule</Text>
              <Text style={styles.subsectionSubtitle}>
                Choose when to receive notifications before cards expire
              </Text>
              
              {[30, 14, 7, 3, 1].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={styles.checkboxItem}
                  onPress={() => handleDaysBeforeExpiryChange(days)}
                >
                  <View style={[
                    styles.checkbox,
                    settings.notifications.daysBeforeExpiry.includes(days) && styles.checkboxChecked
                  ]}>
                    {settings.notifications.daysBeforeExpiry.includes(days) && (
                      <Icon name="check" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    {days === 1 ? '1 day before' : `${days} days before`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Reminder Time</Text>
              <TouchableOpacity
                style={styles.timePicker}
                onPress={() => {
                  // In a real app, you would show a time picker
                  Alert.alert(
                    'Set Reminder Time',
                    'Choose when to receive daily reminders',
                    [
                      { text: '9:00 AM', onPress: () => handleReminderTimeChange('09:00') },
                      { text: '12:00 PM', onPress: () => handleReminderTimeChange('12:00') },
                      { text: '6:00 PM', onPress: () => handleReminderTimeChange('18:00') },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }}
              >
                <Text style={styles.timePickerText}>{settings.notifications.reminderTime}</Text>
                <Icon name="access-time" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        {renderSettingItem(
          'attach-money',
          'Default Currency',
          'Choose your preferred currency',
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              Alert.alert(
                'Select Currency',
                'Choose your default currency',
                [
                  { text: 'USD ($)', onPress: () => handleCurrencyChange('USD') },
                  { text: 'EUR (€)', onPress: () => handleCurrencyChange('EUR') },
                  { text: 'GBP (£)', onPress: () => handleCurrencyChange('GBP') },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
          >
            <Text style={styles.pickerButtonText}>{settings.currency}</Text>
            <Icon name="arrow-drop-down" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}

        {renderSettingItem(
          'palette',
          'Theme',
          'Choose your preferred appearance',
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              Alert.alert(
                'Select Theme',
                'Choose your preferred theme',
                [
                  { text: 'Light', onPress: () => handleThemeChange('light') },
                  { text: 'Dark', onPress: () => handleThemeChange('dark') },
                  { text: 'Auto', onPress: () => handleThemeChange('auto') },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
          >
            <Text style={styles.pickerButtonText}>
              {settings.theme === 'light' ? 'Light' : settings.theme === 'dark' ? 'Dark' : 'Auto'}
            </Text>
            <Icon name="arrow-drop-down" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}

        {renderSettingItem(
          'language',
          'Language',
          'Choose your preferred language',
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              Alert.alert(
                'Select Language',
                'Choose your preferred language',
                [
                  { text: 'English', onPress: () => handleLanguageChange('en') },
                  { text: 'Spanish', onPress: () => handleLanguageChange('es') },
                  { text: 'French', onPress: () => handleLanguageChange('fr') },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
          >
            <Text style={styles.pickerButtonText}>
              {settings.language === 'en' ? 'English' : settings.language === 'es' ? 'Spanish' : 'French'}
            </Text>
            <Icon name="arrow-drop-down" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Data Management Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        {renderSettingItem(
          'file-download',
          'Export Data',
          'Export your gift cards to a file',
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExportData}
          >
            <Text style={styles.actionButtonText}>Export</Text>
          </TouchableOpacity>
        )}

        {renderSettingItem(
          'delete-forever',
          'Clear All Data',
          'Permanently delete all gift cards and settings',
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearAllData}
          >
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        {renderSettingItem(
          'info',
          'Version',
          '1.0.0',
          null
        )}

        {renderSettingItem(
          'description',
          'Description',
          'Gift Card Manager - Scan, organize, and track your gift cards',
          null
        )}
      </View>

      <View style={styles.bottomSpacing} />
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  settingRight: {
    marginLeft: 16,
  },
  subsection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subsectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 18,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  timePickerText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  dangerButtonText: {
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SettingsScreen;