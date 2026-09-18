import { defineParadoxConfig } from '@ankhorage/paradox';

export default defineParadoxConfig({
  mode: 'write',
  docs: {
    title: '@ankhorage/graph',
    description: 'Canonical generic directed graph model and deterministic graph algorithms.',
  },
  package: {
    root: '.',
    entrypoints: ['src/graph.ts'],
  },
  output: { dir: './paradox' },
});
