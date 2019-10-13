import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import pkg from './package.json';

export default [
	// browser-friendly UMD build
	{
        input: 'index.js',
        external: [
            '@soundstep/infuse',
            'signals'
        ],
		output: {
			name: 'soma',
			file: pkg.browser,
			format: 'umd',
            globals: {
                '@soundstep/infuse': 'infuse',
                'signals': 'signals'
            }
        },
		plugins: [
			resolve(), // so Rollup can find `ms`
            commonjs() // so Rollup can convert `ms` to an ES module
		]
	},
	// browser-friendly UMD build
	{
        input: 'index.js',
        external: [
            '@soundstep/infuse',
            'signals'
        ],
		output: {
			name: 'soma',
			file: pkg.browser.replace('.js', '.min.js'),
			format: 'umd',
            globals: {
                '@soundstep/infuse': 'infuse',
                'signals': 'signals'
            }
        },
		plugins: [
			resolve(), // so Rollup can find `ms`
            commonjs(), // so Rollup can convert `ms` to an ES module
            terser()
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify 
	// `file` and `format` for each target)
	{
		input: 'index.js',
		external: [
            '@soundstep/infuse',
            'signals'
        ],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		]
	}
];
