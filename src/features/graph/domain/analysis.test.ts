import { describe, expect, test } from 'bun:test';

import { createGraph } from './createGraph.js';
import { findCyclePath } from './findCyclePath.js';
import { findCyclicComponents } from './findCyclicComponents.js';
import { findStronglyConnectedComponents } from './findStronglyConnectedComponents.js';
import { topologicalSort } from './topologicalSort.js';

describe('graph analysis', () => {
  test('finds strongly connected and cyclic components', () => {
    const graph = createGraph({
      nodes: ['a', 'b', 'c', 'd'].map((id) => ({ id, data: {} })),
      edges: [
        { id: 'a-b', source: 'a', target: 'b', data: {} },
        { id: 'b-a', source: 'b', target: 'a', data: {} },
        { id: 'c-c', source: 'c', target: 'c', data: {} },
      ],
    });

    expect(findStronglyConnectedComponents(graph)).toEqual([['a', 'b'], ['c'], ['d']]);
    expect(findCyclicComponents(graph)).toEqual([['a', 'b'], ['c']]);
    expect(findCyclePath(graph)).toEqual(['a', 'b', 'a']);
    expect(findCyclePath(graph, ['c'])).toEqual(['c', 'c']);
    expect(findCyclePath(graph, ['d'])).toBeNull();
    expect(topologicalSort(graph)).toBeNull();
  });

  test('returns deterministic topological order for acyclic graphs', () => {
    const graph = createGraph({
      nodes: ['a', 'b', 'c', 'd'].map((id) => ({ id, data: {} })),
      edges: [
        { id: 'a-c', source: 'a', target: 'c', data: {} },
        { id: 'b-c', source: 'b', target: 'c', data: {} },
        { id: 'c-d', source: 'c', target: 'd', data: {} },
      ],
    });

    expect(topologicalSort(graph)).toEqual(['a', 'b', 'c', 'd']);
  });
});
