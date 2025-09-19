import { nicheBase, nichePrettier, nicheTests } from '@schibsted/niche-eslint-config';

export default [
    ...nicheBase,
    ...nicheTests,
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
];
