const path = require('path');

module.exports = {
	mode: 'production',
	entry: {
		background: './src/background.ts',
		'fuskr-core': './src/fuskr-core.ts',
	},
	output: {
		path: path.resolve(__dirname, '../../dist/chromium'),
		filename: '[name].js',
		library: {
			name: 'FuskrCore',
			type: 'umd',
			umdNamedDefine: true,
		},
		globalObject: 'this',
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: {
					loader: 'ts-loader',
					options: {
						onlyCompileBundledFiles: true,
					},
				},
				exclude: /node_modules/,
			},
		],
	},
	target: 'webworker',
};
