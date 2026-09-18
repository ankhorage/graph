import { describe, expect, test } from 'bun:test';

import { createGraph } from './createGraph.js';

describe('createGraph', () => {
  test('sorts graph identities deterministically', () => {
    const graph = createGraph({
      nodes: [
        { id: 'b', data: {} },
        { id: 'a', data: {} },
      ],
      edges: [{ id: 'edge-b-a', source: 'b', target: 'a', data: { weight: 2 } }],
    });

    expect(graph.nodes.map(({ id }) => id)).toEqual(['a', 'b']);
    expect(graph.edges.map(({ id }) => id)).toEqual(['edge-b-a']);
  });

  test('rejects duplicate and dangling identities', () => {
    expect(() =>
      createGraph({
        nodes: [
          { id: 'a', data: {} },
          { id: 'a', data: {} },
        ],
        edges: [],
      }),
    ).toThrow('Duplicate graph node ID');

    expect(() =>
      createGraph({
        nodes: [{ id: 'a', data: {} }],
        edges: [{ id: 'missing', source: 'a', target: 'b', data: {} }],
      }),
    ).toThrow('references an unknown endpoint');
  });
});
