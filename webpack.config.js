import path from 'path';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: {
    background: './src/background.js',
    'content/content': './src/content/content.js',
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
