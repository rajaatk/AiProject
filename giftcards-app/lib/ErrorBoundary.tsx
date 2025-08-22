import React from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = { children: React.ReactNode };

type State = { error: Error | null; info: React.ErrorInfo | null };

export class ErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { error: null, info: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { error, info: null };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo): void {
		this.setState({ info });
		console.error('ErrorBoundary caught:', error, info);
	}

	reload = () => {
		if (typeof window !== 'undefined') window.location.reload();
	};

	render() {
		if (this.state.error) {
			return (
				<View style={styles.container}>
					<Text style={styles.title}>Something went wrong</Text>
					<Text style={styles.message}>{this.state.error.message}</Text>
					<ScrollView style={styles.scroll}>
						<Text selectable style={styles.stack}>{this.state.info?.componentStack ?? this.state.error.stack}</Text>
					</ScrollView>
					<Button title="Reload" onPress={this.reload} />
				</View>
			);
		}
		return this.props.children;
	}
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 18, fontWeight: '800' },
	message: { color: '#dc2626' },
	scroll: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 8 },
	stack: { fontFamily: 'monospace' },
});