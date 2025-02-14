module.exports = {
	env: {
		node: '>=21.0.0',
		es2021: true
	},
	extends: ['eslint:recommended', 'plugin:node/recommended'],
	plugins: ['security', 'node', 'import', 'eslint-plugin-eslint-plugin', 'sonarjs'],
	rules: {
		// ESLint Recommended Rules
		// 'no-console': 'warn',
		'no-unused-vars': 'error',
		'no-new-wrappers': 'error',
		'no-path-concat': 'error',
		'no-alert': 'error',

		// Deprecated
		'no-compare-neg-zero': 'error', // Disallow comparing against -0 (may lead to unexpected behavior)

		// Node.js and CommonJS
		'no-process-exit': 'error', // Disallow the use of process.exit() (can abruptly terminate the Node.js process)
		'no-new-require': 'error', // Disallow the use of new require() (can dynamically load and execute modules)

		// XSS (Cross-Site Scripting) Prevention
		'no-script-url': 'error', // Disallow the use of javascript: URLs

		// Regular Expressions for mongodb
		// 'no-control-regex': 'error', // Disallow control characters in regular expressions (may be used for security exploits)
		// 'no-invalid-regexp': 'error', // Disallow invalid regular expressions (can lead to denial of service)

		'no-global-assign': 'error', // Disallow reassigning built-in objects like Object, Array, or Math

		'no-process-env': 'warn', // Disallow the use of process.env (may expose sensitive information)

		'no-mixed-requires': 'error', // Disallow mixing regular variable and require declarations (may obscure dependencies)

		'no-restricted-properties': [
			'error',
			{
				// Disallow specific properties on certain objects (e.g., window.alert)
				object: 'window',
				property: 'alert',
				message: 'Use a more secure alternative to alert'
			}
		],

		'no-useless-catch': 'error', // Disallow unnecessary catch clauses (may swallow errors and hide vulnerabilities)

		// Node.js Rules
		'node/no-unsupported-features/node-builtins': ['error', { version: '>=21.0.0' }],
		'node/no-unsupported-features/es-builtins': ['error', { version: '>=21.0.0' }],
		'node/no-unsupported-features/es-syntax': ['error', { version: '>=21.0.0' }],

		// Security Rules
		'security/detect-object-injection': 'warn', // Detects object injection vulnerabilities
		'security/detect-possible-timing-attacks': 'error', // Warns about potential timing attacks
		// 'security/detect-non-literal-regexp': 'warn', // Warns when non-literal values are used in regular expressions
		// 'security/detect-non-literal-fs-filename': 'warn', // Warns when non-literal values are used in file system operations
		'security/detect-unsafe-regex': 'warn', // Warns about unsafe regular expressions
		'security/detect-child-process': 'error', // Warns about insecure use of child processes
		'security/detect-eval-with-expression': 'error', // Warns about eval() with expressions
		'security/detect-non-literal-require': 'error', // Warns about non-literal values in require statements
		'security/detect-pseudoRandomBytes': 'error', // Warns about the use of pseudoRandomBytes
		'security/detect-new-buffer': 'error', // Warns about using the Buffer constructor

		// Import Rules
		'import/no-unresolved': 'error', // Ensures imports are resolved correctly
		'import/no-extraneous-dependencies': ['error', { devDependencies: false }],

		// Additional Rules from sonarjs
		'sonarjs/cognitive-complexity': ['warn', 20], // Warns about overly complex code
		'sonarjs/max-switch-cases': ['error', 10], // Warns when the number of switch cases exceeds a threshold
		'sonarjs/no-all-duplicated-branches': 'error', // Detects all duplicated branches in code
		'sonarjs/no-collapsible-if': 'error', // Warns about collapsible if statements
		'sonarjs/no-collection-size-mischeck': 'error', // Warns about mischecks in collection sizes
		// 'sonarjs/no-duplicate-string': 'error', // Detects duplicate strings in code
		'sonarjs/no-duplicated-branches': 'error', // Detects duplicated branches in code
		'sonarjs/no-element-overwrite': 'error', // Warns about element overwrites in arrays
		'sonarjs/no-extra-arguments': 'error', // Warns about extra arguments in function calls
		'sonarjs/no-gratuitous-expressions': 'error', // Warns about gratuitous expressions
		'sonarjs/no-identical-conditions': 'error', // Warns about identical conditions in if-else chains
		'sonarjs/no-identical-expressions': 'error', // Warns about identical expressions in assignments
		'sonarjs/no-inverted-boolean-check': 'error', // Warns about inverted boolean checks
		'sonarjs/no-redundant-boolean': 'error', // Warns about redundant boolean values
		'sonarjs/no-redundant-jump': 'error', // Warns about redundant jumps in code
		'sonarjs/no-same-line-conditional': 'error', // Warns about conditionals on the same line as code
		'sonarjs/no-small-switch': 'error', // Warns about small switch statements
		'sonarjs/no-unused-collection': 'error', // Warns about unused collections
		'sonarjs/no-use-of-empty-return-value': 'error', // Warns about using empty return values
		'sonarjs/prefer-immediate-return': 'error', // Encourages immediate return from functions
		'sonarjs/prefer-object-literal': 'error', // Encourages the use of object literals
		'sonarjs/prefer-single-boolean-return': 'error', // Encourages single boolean return statements
		'sonarjs/prefer-while': 'error' // Encourages the use of while loops
	}
};
