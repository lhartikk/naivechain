const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const binaries  = (packageName) => ['.bin'].includes(packageName) === false;
const moduleObj = (acc, curr, index) => ({ ...acc, [curr]: `commonjs ${curr}` });

let nodeModules = fs.readdirSync('node_modules').filter(binaries).reduce(moduleObj, {});

module.exports = {
	entry: './source.js',

	externals: nodeModules,

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: { loader: 'babel-loader' }
			}
		]
	},

	output: {
		filename: 'compiled.js',
		path: path.resolve(__dirname, 'dist')
	},

	plugins: [new UglifyJSPlugin()],

	target: 'node',
};
