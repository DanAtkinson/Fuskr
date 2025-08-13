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
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  target: 'webworker',
};
