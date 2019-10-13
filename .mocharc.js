module.exports = {
    diff: true,
    extension: ['js'],
    opts: false,
    package: './package.json',
    reporter: 'spec',
    slow: 75,
    timeout: 2000,
    ui: 'bdd',
    'watch-files': ['tests/**/*.js'],
    'watch-ignore': []
};
