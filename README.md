# Gift Card Manager

A comprehensive mobile application for scanning, organizing, and managing gift cards with intelligent expiration notifications.

## Features

### 🎯 Core Functionality
- **QR Code & Barcode Scanning**: Scan gift cards using your device's camera
- **Manual Entry**: Add gift cards manually with detailed information
- **Smart Organization**: Categorize and organize gift cards by store, type, and expiration
- **Balance Tracking**: Keep track of gift card balances and total portfolio value

### 🔔 Intelligent Notifications
- **Expiration Reminders**: Get notified before gift cards expire
- **Customizable Schedule**: Choose when to receive reminders (1, 3, 7, 14, 30 days before expiry)
- **Smart Timing**: Set preferred reminder times for daily notifications
- **Push Notifications**: Never miss an important expiration date

### 📱 Modern UI/UX
- **Clean Design**: Modern, intuitive interface following iOS/Android design guidelines
- **Responsive Layout**: Optimized for all screen sizes and orientations
- **Dark/Light Themes**: Choose your preferred appearance
- **Smooth Navigation**: Tab-based navigation with stack navigation for detailed views

### 🗂️ Data Management
- **Local Storage**: Secure local storage using AsyncStorage
- **Search & Filter**: Find gift cards quickly with search and category filters
- **Sorting Options**: Sort by name, balance, or expiration date
- **Export Data**: Export your gift card data for backup or sharing

## Screens

### 1. Home Dashboard
- Overview of total cards and balance
- Quick action buttons for scanning and adding cards
- List of cards expiring soon
- Summary statistics

### 2. Scan Screen
- Camera-based QR code and barcode scanning
- Automatic data extraction from scanned codes
- Permission handling for camera access
- Manual entry fallback option

### 3. Cards Management
- Complete list of all gift cards
- Search and filtering capabilities
- Category-based organization
- Card status management (active/inactive)

### 4. Card Details
- Detailed view of individual gift cards
- Edit card information inline
- Expiration status indicators
- Delete and management actions

### 5. Settings
- Notification preferences
- Currency and language settings
- Theme customization
- Data export and management

## Technical Stack

- **React Native**: Cross-platform mobile development
- **TypeScript**: Type-safe development
- **React Navigation**: Navigation between screens
- **AsyncStorage**: Local data persistence
- **React Native Camera**: Camera and scanning functionality
- **Push Notifications**: Local notification scheduling
- **Vector Icons**: Material Design icon set

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gift-card-manager
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. iOS Setup (macOS only)
```bash
cd ios
pod install
cd ..
```

### 4. Run the Application

#### Android
```bash
npx react-native run-android
```

#### iOS
```bash
npx react-native run-ios
```

### 5. Start Metro Bundler
```bash
npx react-native start
```

## Project Structure

```
src/
├── screens/           # Screen components
│   ├── HomeScreen.tsx
│   ├── ScanScreen.tsx
│   ├── CardsScreen.tsx
│   ├── AddCardScreen.tsx
│   ├── CardDetailScreen.tsx
│   └── SettingsScreen.tsx
├── services/          # Business logic services
│   ├── storageService.ts
│   └── notificationService.ts
├── types/            # TypeScript type definitions
│   ├── navigation.ts
│   └── giftCard.ts
└── components/       # Reusable UI components
```

## Usage

### Adding Gift Cards

1. **Scan Method**:
   - Navigate to the Scan tab
   - Point camera at QR code or barcode
   - Review extracted information
   - Complete any missing details
   - Save the card

2. **Manual Method**:
   - Use the "Add Manually" option
   - Fill in all required fields
   - Set expiration date if applicable
   - Add notes and category
   - Save the card

### Managing Notifications

1. **Enable Notifications**: Go to Settings → Notifications
2. **Set Reminder Schedule**: Choose days before expiry (1, 3, 7, 14, 30)
3. **Set Reminder Time**: Choose preferred time for daily reminders
4. **Customize**: Enable/disable notifications per card

### Organizing Cards

1. **Categories**: Use predefined categories or create custom ones
2. **Search**: Find cards by name, store, or card number
3. **Filter**: Filter by category or status
4. **Sort**: Sort by name, balance, or expiration date

## Configuration

### Notification Settings
- **Default Schedule**: 7, 3, and 1 day before expiry
- **Default Time**: 9:00 AM
- **Customizable**: Full control over reminder preferences

### Currency Support
- **USD** (default)
- **EUR**
- **GBP**
- **Extensible**: Easy to add more currencies

### Theme Options
- **Light**: Default light theme
- **Dark**: Dark mode for low-light environments
- **Auto**: Follows system appearance settings

## Permissions

The app requires the following permissions:

- **Camera**: For scanning QR codes and barcodes
- **Notifications**: For expiration reminders
- **Storage**: For saving gift card data locally

## Troubleshooting

### Common Issues

1. **Camera Permission Denied**:
   - Go to device settings
   - Enable camera access for the app
   - Restart the app

2. **Notifications Not Working**:
   - Check notification permissions in device settings
   - Verify notification settings in the app
   - Restart the device if issues persist

3. **Scanning Issues**:
   - Ensure good lighting conditions
   - Hold device steady
   - Clean camera lens
   - Try manual entry as alternative

### Development Issues

1. **Metro Bundler Errors**:
   ```bash
   npx react-native start --reset-cache
   ```

2. **Build Failures**:
   ```bash
   cd android && ./gradlew clean && cd ..
   cd ios && xcodebuild clean && cd ..
   ```

3. **Dependency Issues**:
   ```bash
   rm -rf node_modules
   npm install
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the documentation

## Roadmap

### Future Features
- **Cloud Sync**: Backup and sync across devices
- **Multiple Currencies**: Support for more currencies
- **Advanced Analytics**: Spending patterns and insights
- **Social Features**: Share and gift card recommendations
- **OCR Support**: Extract information from card images
- **Wallet Integration**: Connect with digital wallets

---

**Built with ❤️ using React Native**