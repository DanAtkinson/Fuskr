const path = require('path');

module.exports = {
	mode: 'production',
	entry: './src/background.ts',
	output: {
		path: path.resolve(__dirname, 'dist/chromium'),
		filename: 'background.js',
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	target: 'webworker',
};
