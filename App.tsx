import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import CardsScreen from './src/screens/CardsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddCardScreen from './src/screens/AddCardScreen';
import CardDetailScreen from './src/screens/CardDetailScreen';

// Types
import { RootStackParamList, TabParamList } from './src/types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Scan':
              iconName = 'qr-code-scanner';
              break;
            case 'Cards':
              iconName = 'credit-card';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Cards" component={CardsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#007AFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddCard"
          component={AddCardScreen}
          options={{ title: 'Add Gift Card' }}
        />
        <Stack.Screen
          name="CardDetail"
          component={CardDetailScreen}
          options={{ title: 'Card Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;