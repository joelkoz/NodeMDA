var path = require('path');
var webpack = require('webpack');
var isDev = require('isdev');
var merge = require('webpack-merge');

let Config = {

    entry: [
      'babel-polyfill',
 	    path.join(__dirname, 'client/index.jsx') // The client appʼs entry point
    ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  
    module: {
  		loaders: [
    		{ 
    			test: /\.jsx?$/, 
          loader: 'babel',
          include: [
             path.resolve(__dirname, "client")
          ],
          query: {
            presets: ['es2015', 'react']
          },          
    		}
  		]
    },

    resolve: {
      root: path.join(__dirname, 'client'),
      alias: {
        common: path.join(__dirname, 'common')
      },
      extensions: ['', '.js', '.jsx'],
      packageAlias: 'browser'
    },

    plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),      // Webpack 1.0
      // new webpack.optimize.OccurrenceOrderPlugin(),  // Webpack 2.0 fixed this mispelling
      new webpack.DefinePlugin({
        'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    ]

};


if (isDev) {
  Config = merge(Config, {
    devtool: 'eval',
    entry: ['webpack-hot-middleware/client'],
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
    ],
  });
}

module.exports = Config;
