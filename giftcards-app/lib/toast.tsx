import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

export type ToastKind = 'success' | 'error' | 'info';

type Toast = { id: number; message: string; kind: ToastKind };

type ToastContextValue = {
	show: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
	return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const [opacity] = useState(new Animated.Value(0));

	const show = useCallback((message: string, kind: ToastKind = 'info') => {
		setToasts((prev) => [{ id: Date.now(), message, kind }, ...prev].slice(0, 3));
		Animated.timing(opacity, { toValue: 1, duration: 150, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(() => {
			setTimeout(() => {
				Animated.timing(opacity, { toValue: 0, duration: 250, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(() => {
					setToasts((prev) => prev.slice(1));
				});
			}, 1500);
		});
	}, [opacity]);

	const value = useMemo(() => ({ show }), [show]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<View pointerEvents="none" style={styles.container}>
				{toasts.map((t, idx) => (
					<Animated.View key={t.id} style={[styles.toast, styles[t.kind], { opacity, transform: [{ translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
						<Text style={styles.text}>{t.message}</Text>
					</Animated.View>
				))}
			</View>
		</ToastContext.Provider>
	);
}

const styles = StyleSheet.create({
	container: { position: 'absolute', left: 0, right: 0, top: 60, alignItems: 'center' },
	toast: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, marginVertical: 6, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 },
	text: { color: 'white', fontWeight: '700' },
	success: { backgroundColor: '#16a34a' },
	error: { backgroundColor: '#dc2626' },
	info: { backgroundColor: '#2563eb' },
});