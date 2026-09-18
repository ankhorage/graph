import { createKnipConfig } from '@ankhorage/devtools/knip';

export default createKnipConfig({
  entry: [
    'src/graph.ts',
    'examples/**/*.ts',
    'eslint.config.mjs',
    'eslint.examples.config.mjs',
    'eslint.local.config.mjs',
    '.prettierrc.js',
    'prettier.local.config.js',
  ],
});
