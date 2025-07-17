module.exports = function (config) {
	config.set({
		basePath: '',
		frameworks: ['jasmine', '@angular-devkit/build-angular'],
		plugins: [
			require('karma-jasmine'),
			require('karma-chrome-launcher'),
			require('@angular-devkit/build-angular/plugins/karma')
		],
		client: {
			jasmine: {
				random: false
			},
			clearContext: false
		},
		reporters: ['progress'],
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
					'--remote-debugging-port=9222'
				]
			}
		},
		singleRun: true,
		restartOnFileChange: false,
		captureTimeout: 60000,
		browserDisconnectTolerance: 3,
		browserDisconnectTimeout: 10000,
		browserNoActivityTimeout: 60000
	});
};
