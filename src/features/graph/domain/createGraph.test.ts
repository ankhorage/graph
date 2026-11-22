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

  test('preserves optional graph labels and edge types', () => {
    const graph = createGraph({
      nodes: [{ id: 'a', labels: ['Package'], data: {} }],
      edges: [{ id: 'a-a', source: 'a', target: 'a', type: 'DEPENDS_ON', data: {} }],
    });

    expect(graph.nodes[0]?.labels).toEqual(['Package']);
    expect(graph.edges[0]?.type).toBe('DEPENDS_ON');
  });
});
