// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
	{
		files: ['**/*.ts'],
		ignores: [
			'**/coverage/**', 
			'**/dist/**', 
			'**/node_modules/**', 
			'src/config/coverage/**',
			'coverage/**',
			'.nyc_output/**'
		],
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.recommended,
			...tseslint.configs.stylistic,
			...angular.configs.tsRecommended,
		],
		processor: angular.processInlineTemplates,
		rules: {
			// Make indentation more lenient - let Prettier handle formatting
			indent: 'off',
			'@typescript-eslint/indent': 'off',
			// Keep other quality rules
			'@angular-eslint/directive-selector': [
				'error',
				{
					type: 'attribute',
					prefix: 'app',
					style: 'camelCase',
				},
			],
			'@angular-eslint/component-selector': [
				'error',
				{
					type: 'element',
					prefix: 'app',
					style: 'kebab-case',
				},
			],
		},
	},
	{
		files: ['**/*.html'],
		ignores: [
			'**/coverage/**', 
			'**/dist/**', 
			'**/node_modules/**', 
			'src/config/coverage/**',
			'coverage/**',
			'.nyc_output/**'
		],
		extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
		rules: {},
	}
);
