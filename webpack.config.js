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
				test: {},
				exclude: /node_modules/,
				loader: 'babel-loader',

				options: {
					presets: ['env']
				}
			}
		]
	},

	plugins: [new UglifyJSPlugin()]
};
