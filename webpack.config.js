const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const binaries  = (packageName) => ['.bin'].includes(packageName) === false;
const moduleObj = (acc, curr, index) => ({ ...acc, [curr]: `commonjs ${curr}` });

let nodeModules = fs.readdirSync('node_modules').filter(binaries).reduce(moduleObj, {});

module.exports = {
	entry: './main.js',

	externals: nodeModules,

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

	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist')
	},

	plugins: [new UglifyJSPlugin()],

	target: 'node',
};
