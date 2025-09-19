import { nicheBase, nichePrettier } from '@schibsted/niche-eslint-config';
import globals from 'globals';

export default [
    ...nicheBase,
    ...nichePrettier,
    {
        ignores: ['node_modules'],
    },
    {
        rules: {
            'import/no-unresolved': [
                'error',
                {
                    ignore: ['^dictionary$', '^utils$', '^logger$', '^graphqlClient$'],
                },
            ],
        },
    },
    {
        rules: {
            'import/extensions': [
                'error',
                {
                    js: 'always',
                },
            ],
            'import/no-unresolved': ['error', { ignore: ['yargs/helpers'] }],
        },
    },
    {
        files: ['src/page/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                jsondiffpatch: true,
            },
        },
    },
];
