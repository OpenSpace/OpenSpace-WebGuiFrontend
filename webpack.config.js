const { resolve } = require('path');
const webpack = require('webpack');

const PublicPath = '/frontend/';

module.exports = {
  mode: 'development',
  context: resolve(__dirname, 'src'),
  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:4690',
    'webpack/hot/only-dev-server',
    './devmode.js',
    './index.jsx',
  ],
  output: {
    filename: 'static/bundle.js',
    path: resolve(__dirname, 'dist'),
    publicPath: PublicPath,
  },
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
    hot: true,
    contentBase: resolve(__dirname, 'dist'),
    publicPath: PublicPath,
    proxy: {
      '/': {
        target: 'http://localhost:4680',
        bypass: function(req, res, proxyOptions) {
          if (req.originalUrl.indexOf('/frontend') === 0 ||
              req.originalUrl.indexOf('/environment.js') === 0)
          {
            return req.originalUrl;
          }
        }
      }
    }
  },
  module: {
    rules: [
      // Load JS!
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      // Load SASS!
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader',
          }, {
            loader: 'css-loader?modules',
            options: {
              sourceMap: true,
              importLoaders: 2,
              modules: {
                localIdentName: "[path][name]__[local]--[hash:base64:7]",
              }
            },
          }, {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]',
        },
      },
      {
        test: /\.(png)$/,
        loader: 'file-loader',
        options: {
          name: 'img/[name].[ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    // enable HMR globally
    new webpack.HotModuleReplacementPlugin(),
    // prints more readable module names in the browser console on HMR updates
    new webpack.NamedModulesPlugin(),
  ],
};
