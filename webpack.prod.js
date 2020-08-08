const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

prodExports = {
  mode: 'production',
  output: { path: __dirname, filename: 'lib/bundle.min.js' },
  devtool: false,
}

module.exports = merge(common, prodExports);