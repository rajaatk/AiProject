// Web-only polyfills and guards
if (typeof window !== 'undefined' && typeof (window as any).CSSStyleDeclaration !== 'undefined') {
	try {
		const proto = (window as any).CSSStyleDeclaration.prototype as any;
		// Prevent crashes when libraries attempt to set style[0]
		if (proto && !Object.getOwnPropertyDescriptor(proto, '0')) {
			Object.defineProperty(proto, '0', {
				configurable: true,
				enumerable: false,
				get() { return undefined; },
				set(_value: any) { /* no-op to avoid crash */ },
			});
		}
	} catch (e) {
		// ignore
	}
}