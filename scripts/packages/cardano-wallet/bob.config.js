module.exports = {
  source: '.',
  output: 'lib',
  targets: [
    'commonjs',
    'module',
    [
      'typescript',
      {
        project: 'tsconfig.build.json',
        tsc: './node_modules/.bin/tsc',
      },
    ],
  ],
}

