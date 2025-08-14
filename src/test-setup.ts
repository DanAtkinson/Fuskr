// Test setup file for polyfills and global configurations

// URL polyfill for test environment
if (!globalThis.URL) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(globalThis as any).URL = class {
		href: string;
		protocol: string;
		hostname: string;
		pathname: string;
		search: string;
		hash: string;

		constructor(input: string) {
			this.href = input;
			this.protocol = 'https:';
			this.hostname = 'example.com';
			this.pathname = '/test';
			this.search = '';
			this.hash = '';
		}
	};
}

// Location object mock for test environment
if (!globalThis.location) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(globalThis as any).location = {
		href: 'https://example.com',
		protocol: 'https:',
		hostname: 'example.com',
		pathname: '/',
		search: '',
		hash: '',
	};
}
