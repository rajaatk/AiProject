import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from './AppNavigator';

// Navigation prop types for each screen
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type GiftCardListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GiftCardList'>;
export type AddGiftCardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddGiftCard'>;
export type EditGiftCardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditGiftCard'>;
export type GiftCardDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GiftCardDetail'>;
export type BarcodeScannerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BarcodeScanner'>;
export type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;
export type NotificationsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Notifications'>;

// Route prop types for each screen
export type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
export type GiftCardListScreenRouteProp = RouteProp<RootStackParamList, 'GiftCardList'>;
export type AddGiftCardScreenRouteProp = RouteProp<RootStackParamList, 'AddGiftCard'>;
export type EditGiftCardScreenRouteProp = RouteProp<RootStackParamList, 'EditGiftCard'>;
export type GiftCardDetailScreenRouteProp = RouteProp<RootStackParamList, 'GiftCardDetail'>;
export type BarcodeScannerScreenRouteProp = RouteProp<RootStackParamList, 'BarcodeScanner'>;
export type SettingsScreenRouteProp = RouteProp<RootStackParamList, 'Settings'>;
export type NotificationsScreenRouteProp = RouteProp<RootStackParamList, 'Notifications'>;

// Combined props for screens that need both navigation and route
export type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
};

export type GiftCardListScreenProps = {
  navigation: GiftCardListScreenNavigationProp;
  route: GiftCardListScreenRouteProp;
};

export type AddGiftCardScreenProps = {
  navigation: AddGiftCardScreenNavigationProp;
  route: AddGiftCardScreenRouteProp;
};

export type EditGiftCardScreenProps = {
  navigation: EditGiftCardScreenNavigationProp;
  route: EditGiftCardScreenRouteProp;
};

export type GiftCardDetailScreenProps = {
  navigation: GiftCardDetailScreenNavigationProp;
  route: GiftCardDetailScreenRouteProp;
};

export type BarcodeScannerScreenProps = {
  navigation: BarcodeScannerScreenNavigationProp;
  route: BarcodeScannerScreenRouteProp;
};

export type SettingsScreenProps = {
  navigation: SettingsScreenNavigationProp;
  route: SettingsScreenRouteProp;
};

export type NotificationsScreenProps = {
  navigation: NotificationsScreenNavigationProp;
  route: NotificationsScreenRouteProp;
};