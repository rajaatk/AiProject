import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

export async function requestNotificationPermissions() {
	const settings = await Notifications.getPermissionsAsync();
	if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED) return true;
	const req = await Notifications.requestPermissionsAsync();
	return req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED;
}