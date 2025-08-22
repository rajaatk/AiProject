import * as Notifications from 'expo-notifications';

try {
	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldShowAlert: true,
			shouldPlaySound: false,
			shouldSetBadge: false,
			shouldShowBanner: true,
			shouldShowList: true,
		}),
	});
} catch (e) {
	// no-op on platforms where notifications are not supported
}

export async function requestNotificationPermissions() {
	try {
		const settings = await Notifications.getPermissionsAsync();
		if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED) return true;
		const req = await Notifications.requestPermissionsAsync();
		return req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED;
	} catch {
		return false;
	}
}