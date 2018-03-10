const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const fs = require('fs');

const binaries  = (packageName) => ['.bin'].includes(packageName) === false;
const moduleObj = (acc, curr, index) => ({ ...acc, [curr]: `commonjs ${curr}` });

let nodeModules = fs.readdirSync('node_modules').filter(binaries).reduce(moduleObj, {});

module.exports = {
	entry: './main.js',

	output: {
		filename: 'index.js',
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
