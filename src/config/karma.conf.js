module.exports = function (config) {
	config.set({
		basePath: '',
		frameworks: ['jasmine', '@angular-devkit/build-angular'],
		plugins: [
			require('karma-jasmine'),
			require('karma-chrome-launcher'),
			require('karma-coverage'),
			require('@angular-devkit/build-angular/plugins/karma'),
		],
		client: {
			jasmine: {
				random: false,
			},
			clearContext: false,
		},
		reporters: ['progress', 'coverage'],
		coverageReporter: {
			dir: require('path').join(__dirname, './coverage/fuskr'),
			subdir: '.',
			reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'lcovonly' }],
			// Treat <80% as red, 80-95% yellow, >95% green in reports
			watermarks: {
				statements: [80, 95],
				functions: [80, 95],
				branches: [80, 95],
				lines: [80, 95],
			},
			// Optional strict thresholds: enable by setting COVERAGE_STRICT=1
			check: process.env.COVERAGE_STRICT === '1' ? {
				global: { statements: 80, functions: 80, branches: 80, lines: 80 },
			} : undefined,
		},
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: false,
		browsers: ['ChromeHeadless'],
		customLaunchers: {
			ChromeHeadlessNoSandbox: {
				base: 'ChromeHeadless',
				flags: [
					'--no-sandbox',
					'--disable-web-security',
					'--disable-gpu',
					'--headless',
					'--remote-debugging-port=9222',
				],
			},
		},
		singleRun: true,
		restartOnFileChange: false,
		captureTimeout: 60000,
		browserDisconnectTolerance: 3,
		browserDisconnectTimeout: 10000,
		browserNoActivityTimeout: 60000,
	});
};
