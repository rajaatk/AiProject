import { Stack } from 'expo-router';
import '../lib/notifications';
import '../lib/web-polyfills';
import { useColorScheme } from 'react-native';
import { ToastProvider } from '../lib/toast';
import { ErrorBoundary } from '../lib/ErrorBoundary';

export default function RootLayout() {
	const scheme = useColorScheme();
	const headerBg = scheme === 'dark' ? '#111827' : '#f9fafb';
	const headerColor = scheme === 'dark' ? '#f9fafb' : '#111827';
	return (
		<ToastProvider>
			<ErrorBoundary>
				<Stack screenOptions={{
					headerStyle: { backgroundColor: headerBg },
					headerTitleStyle: { color: headerColor },
					headerTintColor: headerColor,
				}}>
					<Stack.Screen name="index" options={{ title: 'Gift Cards' }} />
					<Stack.Screen name="scan" options={{ title: 'Scan' }} />
					<Stack.Screen name="edit" options={{ title: 'Add / Edit' }} />
					<Stack.Screen name="detail" options={{ title: 'Details' }} />
				</Stack>
			</ErrorBoundary>
		</ToastProvider>
	);
}