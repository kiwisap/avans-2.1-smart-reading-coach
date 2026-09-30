import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores(['dist', 'node_modules', '_to_delete']),

    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            jsxA11y.flatConfigs.recommended,
        ],
        languageOptions: {
            globals: globals.browser,
        },
        rules: {
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'prefer-const': 'error',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },

    {
        // Vite config runs in Node.
        files: ['vite.config.ts'],
        languageOptions: { globals: globals.node },
    },

    // Must be last: turns off rules that conflict with Prettier.
    prettier,
]);
