import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { DatabaseService } from './src/services/database';
import { NotificationService } from './src/services/notificationService';

// Theme configuration for React Native Paper
const theme = {
  colors: {
    primary: '#6200ea',
    accent: '#03dac4',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#000000',
    disabled: '#rgba(0, 0, 0, 0.26)',
    placeholder: '#rgba(0, 0, 0, 0.54)',
    backdrop: '#rgba(0, 0, 0, 0.5)',
    onSurface: '#000000',
    notification: '#f50057',
  },
};

export default function App() {
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize the database
      await DatabaseService.initialize();
      
      // Set up notification listeners
      NotificationService.setupNotificationListeners();
      
      // Check for expiring cards on app start
      await NotificationService.checkForExpiringCards();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar style="light" backgroundColor="#6200ea" />
          <AppNavigator />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}