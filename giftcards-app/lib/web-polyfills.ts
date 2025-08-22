// Web-only polyfills and guards
if (typeof window !== 'undefined' && typeof (window as any).CSSStyleDeclaration !== 'undefined') {
	try {
		const proto = (window as any).CSSStyleDeclaration.prototype as any;
		// Prevent crashes when libraries attempt to set style[0], style[1], ...
		for (let i = 0; i < 64; i++) {
			const key = String(i);
			const desc = Object.getOwnPropertyDescriptor(proto, key);
			if (!desc) {
				Object.defineProperty(proto, key, {
					configurable: true,
					enumerable: false,
					get() { return undefined; },
					set(_value: any) { /* no-op to avoid crash */ },
				});
			}
		}
	} catch (e) {
		// ignore
	}
}