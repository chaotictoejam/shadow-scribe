const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.js',
    'content/content': './src/content/content.js',
    'content/theme-manager': './src/content/theme-manager.js',
    'content/toggle-button': './src/content/toggle-button.js',
    'utils/storage': './src/utils/storage.js',
    'utils/messaging': './src/utils/messaging.js',
    'options/options': './src/options/options.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/content/dark-mode.css', to: 'content/dark-mode.css' },
        { from: 'src/options/options.html', to: 'options/options.html' },
        { from: 'src/options/options.css', to: 'options/options.css' },
        { from: 'src/icons', to: 'icons' },
      ],
    }),
  ],
  resolve: {
    extensions: ['.js'],
  },
  devtool: 'source-map',
};
