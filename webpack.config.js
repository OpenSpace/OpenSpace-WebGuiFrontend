const { resolve } = require('path');
const webpack = require('webpack');

const PublicPath = '/frontend/';

module.exports = {
  mode: 'development',
  context: resolve(__dirname, 'src'),
  entry: [
    'webpack-dev-server/client?http://localhost:4690',
    'webpack/hot/only-dev-server',
    './devmode.js',
    './index.jsx'
  ],
  output: {
    filename: 'static/bundle.js',
    path: resolve(__dirname, 'dist'),
    publicPath: PublicPath
  },
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
    hot: true,
    static: {
      directory: resolve(__dirname, 'dist'),
      publicPath: PublicPath
    },
    proxy: {
      '/': {
        target: 'http://localhost:4680',
        bypass(req) {
          if (req.originalUrl) {
            return req.originalUrl;
          }
          return false;
        }
      }
    }
  },
  module: {
    rules: [
      // Load JS!
      {
        test: /\.(js|jsx|ts|tsx)$/, // Adjust the test regex to include both JS and TS files
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      // Load SASS!
      {
        test: /\.s[ac]ss$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader?modules',
            options: {
              sourceMap: true,
              importLoaders: 2,
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:7]'
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(png)$/,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@views': resolve(__dirname, 'src/views')
    }
  },
  plugins: [
    // enable HMR globally
    new webpack.HotModuleReplacementPlugin()
  ]
};
