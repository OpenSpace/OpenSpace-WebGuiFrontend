const { resolve } = require('path');
const webpack = require('webpack');
const fs = require('fs');

// PublicPath defines the base path for all assets served by Webpack.
const PublicPath = '/frontend/';

module.exports = {
  // Mode specifies the build mode. 'development' is used for debugging.
  mode: 'development',

  // Context sets the base directory for resolving entry points and loaders.
  context: resolve(__dirname, 'src'),

  // Entry points for the application. These include Webpack Dev Server for live reloading
  // and application-specific files like devmode.js and index.jsx.
  entry: [
    'webpack-dev-server/client?http://localhost:4690', // Enables live reloading
    'webpack/hot/only-dev-server', // Enables Hot Module Replacement (HMR)
    './devmode.js',
    './index.jsx'
  ],

  // Output configuration for the bundled files.
  output: {
    filename: 'static/bundle.js', // Name of the output bundle
    path: resolve(__dirname, 'dist'), // Directory for output files
    publicPath: PublicPath // Base URL for all assets
  },

  // Enables source maps for easier debugging in the browser.
  devtool: 'inline-source-map',

  // Configuration for the Webpack Dev Server.
  devServer: {
    // Ensures the app works with client-side routing by serving index.html for unknown routes.
    historyApiFallback: true,

    // Enables Hot Module Replacement (HMR) for live updates without a full page reload.
    hot: true,

    // Serves static files from the 'dist' directory.
    static: {
      directory: resolve(__dirname, 'dist'),
      publicPath: PublicPath
    },

    // Proxies API requests to a backend server running on http://localhost:4680.
    proxy: {
      '/': {
        target: 'http://localhost:4680',
        // Ensures certain requests (e.g., /frontend and /environment.js) are not proxied.
        bypass(req, res, proxyOptions) {
          if (req.originalUrl.indexOf('/frontend') === 0 ||
              req.originalUrl.indexOf('/environment.js') === 0) {
            return req.originalUrl;
          }
        }
      }
    },

    // Configures HTTPS if the USE_HTTPS environment variable is set to 'true'.
    https: process.env.USE_HTTPS === 'true' ? {
      key: fs.readFileSync(resolve(__dirname, './certs/server.key')), // SSL key
      cert: fs.readFileSync(resolve(__dirname, './certs/server.crt')), // SSL certificate
    } : false, // Defaults to HTTP if USE_HTTPS is not set

    // Makes the server accessible on all network interfaces.
    host: '0.0.0.0',

    // Specifies the port for the development server.
    port: 4690,

    // Automatically opens the application in the default browser.
    open: true,
  },

  // Module rules define how different file types are processed.
  module: {
    rules: [
      // Processes JavaScript and JSX files using Babel.
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      // Processes SASS/SCSS files and enables CSS modules with hashed class names.
      {
        test: /\.s[ac]ss$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader' // Injects styles into the DOM
          },
          {
            loader: 'css-loader?modules', // Resolves CSS imports and enables CSS modules
            options: {
              sourceMap: true,
              importLoaders: 2,
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:7]' // Scoped class names
              }
            }
          },
          {
            loader: 'sass-loader', // Compiles SASS/SCSS to CSS
            options: {
              sourceMap: true
            }
          }
        ]
      },
      // Processes plain CSS files.
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      // Handles font files (e.g., woff, woff2, ttf, eot) as assets.
      {
        test: /\.(woff|woff2|ttf|eot)$/i,
        type: 'asset/resource'
      },
      // Handles PNG image files as assets.
      {
        test: /\.(png)$/,
        type: 'asset/resource'
      }
    ]
  },

  // Specifies file extensions Webpack will resolve automatically.
  resolve: {
    extensions: ['.js', '.jsx']
  },

  // Plugins extend Webpack's functionality.
  plugins: [
    // Enables Hot Module Replacement (HMR) globally.
    new webpack.HotModuleReplacementPlugin()
  ]
};
