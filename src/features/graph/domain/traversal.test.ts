import { describe, expect, test } from 'bun:test';

import { createGraph } from './createGraph.js';
import { filterGraph } from './filterGraph.js';
import { getReachableNodeIds } from './getReachableNodeIds.js';
import { reverseGraph } from './reverseGraph.js';

const graph = createGraph({
  nodes: ['a', 'b', 'c', 'd'].map((id) => ({ id, data: { id } })),
  edges: [
    { id: 'a-b', source: 'a', target: 'b', data: {} },
    { id: 'b-c', source: 'b', target: 'c', data: {} },
    { id: 'd-b', source: 'd', target: 'b', data: {} },
  ],
});

describe('graph traversal and projection', () => {
  test('finds outgoing and incoming reachability', () => {
    expect(getReachableNodeIds(graph, 'a')).toEqual(['b', 'c']);
    expect(getReachableNodeIds(graph, 'c', { direction: 'incoming' })).toEqual(['a', 'b', 'd']);
  });

  test('reverses graph direction without losing metadata', () => {
    const reversed = reverseGraph(graph);
    expect(reversed.edges.find(({ id }) => id === 'a-b')).toEqual({
      id: 'a-b',
      source: 'b',
      target: 'a',
      data: {},
    });
  });

  test('filters nodes and removes dangling edges', () => {
    const projected = filterGraph(graph, { node: ({ id }) => id !== 'b' });
    expect(projected.nodes.map(({ id }) => id)).toEqual(['a', 'c', 'd']);
    expect(projected.edges).toEqual([]);
  });
});
