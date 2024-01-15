/* eslint-env es6 */

const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const terser = require('rollup-plugin-terser').terser;
const pkg = require('./package.json');

const input = 'src/index.js';
const banner = `/*!
 * Chart.js v${pkg.version}
 * ${pkg.homepage}
 * (c) ${new Date().getFullYear()} Chart.js Contributors
 * Released under the MIT License
 */`;

module.exports = [
	// self-executing function builds (excluding moment)
	{
		input: input,
		plugins: [
			resolve(),
			commonjs()
		],
		output: {
			name: 'RichEditor',
			file: 'dist/RichEditor.js',
			banner: banner,
			format: 'umd',
			indent: false,
			globals: {
				moment: 'moment'
			}
		},
		external: [
			'moment'
		]
	},
	{
		input: input,
		plugins: [
			resolve(),
			commonjs(),
			terser({
				output: {
					preamble: banner
				}
			})
		],
		output: {
			name: 'RichEditor',
			file: 'dist/RichEditor.min.js',
			format: 'umd',
			indent: false,
			globals: {
				moment: 'moment'
			}
		},
		external: [
			'moment'
		]
	},

	// self-executing function builds (including moment)
	{
		input: input,
		plugins: [
			resolve(),
			commonjs()
		],
		output: {
			name: 'RichEditor',
			file: 'dist/RichEditor.bundle.js',
			banner: banner,
			format: 'iife',
			indent: false
		}
	},
	{
		input: input,
		plugins: [
			resolve(),
			commonjs(),
			terser({
				output: {
					preamble: banner
				}
			})
		],
		output: {
			name: 'RichEditor',
			file: 'dist/RichEditor.bundle.min.js',
			format: 'iife',
			indent: false
		}
	}
];
