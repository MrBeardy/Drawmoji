var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var WebpackPlugins = [
  new CopyWebpackPlugin([
      { from: 'static' }
  ]),

  new HtmlWebpackPlugin({
    template: __dirname + '/app/index.html',
    filename: 'index.html',
    inject: 'body'
  })
]

module.exports = {
  entry: [
    'babel-polyfill',
    './app/index.js'
  ],
  output: {
    path: __dirname + '/build',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\/.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  plugins: WebpackPlugins
}
