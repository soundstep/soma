import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import pkg from './package.json';

const date = new Date().toLocaleString('en-GB', { timeZone: 'UTC' }).split(',')[0];
const banner = `/* soma - v${pkg.version} - ${date} - https://github.com/soundstep/soma */`;

export default [
	// browser
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
			banner,
            globals: {
                '@soundstep/infuse': 'infuse',
                'signals': 'signals'
            }
        },
		plugins: [
			resolve(),
            commonjs()
		]
	},
	// browser minified
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
			banner,
            globals: {
                '@soundstep/infuse': 'infuse',
                'signals': 'signals'
			}
        },
		plugins: [
			resolve(),
            commonjs(),
            terser({
				output: {
					comments: function(node, comment) {
						var text = comment.value;
						var type = comment.type;
						if (type == "comment2") {
							// keep banner
							return /github.com\/soundstep\/soma/i.test(text);
						}
					}
				}
			})
		]
	},
	// es and cjs
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
