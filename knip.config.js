const config = {
    entry: ['eslint.config.mjs', 'src/page/*'],
    ignore: [],
    ignoreBinaries: ['eslint', 'prettier'],
    ignoreDependencies: [],
    paths: {},
    rules: {
        enumMembers: 'off',
        unlisted: 'off',
    },
};

export default config;
