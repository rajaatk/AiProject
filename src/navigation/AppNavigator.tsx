import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GiftCard } from '../types/GiftCard';

// Import screens
import { HomeScreen } from '../screens/HomeScreen';
import { BarcodeScannerScreen } from '../screens/BarcodeScannerScreen';
import { AddGiftCardScreen } from '../screens/AddGiftCardScreen';
import { GiftCardListScreen } from '../screens/GiftCardListScreen';
import { GiftCardDetailScreen } from '../screens/GiftCardDetailScreen';
import { EditGiftCardScreen } from '../screens/EditGiftCardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';

export type RootStackParamList = {
  Home: undefined;
  GiftCardList: undefined;
  AddGiftCard: {
    barcode?: string;
    barcodeType?: string;
    brand?: string;
  };
  EditGiftCard: {
    giftCard: GiftCard;
  };
  GiftCardDetail: {
    giftCardId: string;
  };
  BarcodeScanner: undefined;
  Settings: undefined;
  Notifications: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ea',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Gift Card Scanner',
            headerStyle: {
              backgroundColor: '#6200ea',
            },
          }}
        />
        
        <Stack.Screen
          name="GiftCardList"
          component={GiftCardListScreen}
          options={{
            title: 'My Gift Cards',
          }}
        />
        
        <Stack.Screen
          name="AddGiftCard"
          component={AddGiftCardScreen}
          options={{
            title: 'Add Gift Card',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="EditGiftCard"
          component={EditGiftCardScreen}
          options={{
            title: 'Edit Gift Card',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="GiftCardDetail"
          component={GiftCardDetailScreen}
          options={{
            title: 'Gift Card Details',
          }}
        />
        
        <Stack.Screen
          name="BarcodeScanner"
          component={BarcodeScannerScreen}
          options={{
            title: 'Scan Barcode',
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
          }}
        />
        
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            title: 'Notifications',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};