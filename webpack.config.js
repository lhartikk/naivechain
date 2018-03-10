const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const fs = require('fs');

let nodeModules = {};

fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].includes(x) === false;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

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

	target: 'node',

	externals: nodeModules,

	plugins: [new UglifyJSPlugin()]
};
