# Gift Card Scanner App

A comprehensive React Native mobile application for scanning, managing, and tracking gift cards with expiration notifications.

## Features

### 🔍 Barcode Scanning
- Scan gift card barcodes using device camera
- Support for multiple barcode formats (QR, UPC, EAN, Code 128, etc.)
- Automatic brand detection for popular gift card types
- Flash toggle for low-light scanning

### 📱 Gift Card Management
- Add gift cards manually or via barcode scanning
- Track current balance and original amount
- Store purchase and expiration dates
- Add custom notes for each card
- Support for multiple currencies

### 🔔 Smart Notifications
- Automatic expiration reminders (30, 7, 3, and 1 day before expiration)
- Customizable notification preferences
- Background notification scheduling
- Immediate alerts for cards expiring today/tomorrow

### 📊 Dashboard & Analytics
- Overview of all gift cards with quick stats
- Filter and search functionality
- Sort by name, brand, balance, or expiration date
- Visual indicators for expired and expiring cards
- Usage tracking with progress bars

### 🎨 Modern UI/UX
- Material Design with React Native Paper
- Dark/light theme support
- Intuitive navigation
- Responsive design for different screen sizes
- Smooth animations and transitions

## Technology Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **SQLite** for local data storage
- **React Navigation** for screen navigation
- **React Native Paper** for UI components
- **Expo Barcode Scanner** for camera functionality
- **Expo Notifications** for push notifications
- **Date-fns** for date manipulation

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gift-card-scanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - For web: `npm run web`

### Building for Production

1. **Configure app.json** with your app details
2. **Build for iOS**
   ```bash
   expo build:ios
   ```
3. **Build for Android**
   ```bash
   expo build:android
   ```

## App Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── navigation/         # Navigation configuration
├── screens/            # App screens/pages
├── services/           # Business logic and API calls
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Key Screens

- **HomeScreen**: Dashboard with overview and quick actions
- **GiftCardListScreen**: List of all gift cards with filtering
- **BarcodeScannerScreen**: Camera interface for scanning
- **AddGiftCardScreen**: Form for manually adding gift cards
- **GiftCardDetailScreen**: Detailed view of individual cards
- **EditGiftCardScreen**: Edit existing gift card information
- **SettingsScreen**: App preferences and configuration
- **NotificationsScreen**: Manage notification settings

## Permissions Required

- **Camera**: For barcode scanning functionality
- **Notifications**: For expiration alerts
- **Storage**: For local database storage

## Database Schema

The app uses SQLite with the following main tables:

### gift_cards
- id (TEXT PRIMARY KEY)
- name (TEXT NOT NULL)
- brand (TEXT NOT NULL)
- balance (REAL NOT NULL)
- original_amount (REAL NOT NULL)
- currency (TEXT NOT NULL DEFAULT 'USD')
- barcode (TEXT)
- barcode_type (TEXT)
- expiration_date (TEXT)
- purchase_date (TEXT)
- notes (TEXT)
- image_uri (TEXT)
- created_at (TEXT NOT NULL)
- updated_at (TEXT NOT NULL)

### settings
- key (TEXT PRIMARY KEY)
- value (TEXT NOT NULL)

## Notification System

The app implements a sophisticated notification system:

1. **Automatic Scheduling**: Notifications are scheduled when cards are added/updated
2. **Multiple Reminders**: 30, 7, 3, and 1 day before expiration
3. **Smart Filtering**: Only active cards with balances receive notifications
4. **Background Processing**: Notifications work even when app is closed

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Customization

### Adding New Barcode Types
Update the `BarcodeScannerService.getSupportedBarcodeTypes()` method in `src/services/barcodeScanner.ts`.

### Modifying Notification Schedule
Adjust the `notificationDays` array in `NotificationService.scheduleAllNotificationsForGiftCard()`.

### Adding New Currencies
Update the `CURRENCIES` array in the form screens.

### Customizing Theme
Modify the theme object in `App.tsx` to change colors and styling.

## Troubleshooting

### Common Issues

1. **Camera not working**: Ensure camera permissions are granted
2. **Notifications not appearing**: Check notification permissions in device settings
3. **Build errors**: Clear node_modules and reinstall dependencies
4. **Database issues**: Clear app data or reinstall the app

### Performance Tips

- Keep the gift card list under 1000 items for optimal performance
- Regularly clean up expired cards to reduce database size
- Use image compression for card photos if implemented

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on the GitHub repository or contact the development team.

---

**Note**: This app is designed for personal use to manage gift cards. Always keep physical copies of important gift cards as backup.