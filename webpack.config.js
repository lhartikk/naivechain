const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	entry: './main.js',

	output: {
		filename: 'x.js',
		path: path.resolve(__dirname, 'dist')
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				options: {
					presets: ['env']
				}
			}
		]
	},

	node: {
  	fs: true,
		bufferutil: true,
		"utf-8-validate": true,
		net: true,
		tls: true
	},

	plugins: [new UglifyJSPlugin()]
};
