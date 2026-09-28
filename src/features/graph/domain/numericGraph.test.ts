import { describe, expect, test } from 'bun:test';

import {
  createGraph,
  filterGraph,
  findCyclePath,
  findCyclicComponents,
  findStronglyConnectedComponents,
  getReachableNodeIds,
  type Graph,
  reverseGraph,
  topologicalSort,
} from '../../../graph.js';

describe('numeric graph identities', () => {
  test('preserves numeric node and edge IDs through traversal and projection', () => {
    const graph: Graph<unknown, unknown, number, number> = createGraph({
      nodes: [10, 2, 1, 3].map((id) => ({ id, data: {} })),
      edges: [
        { id: 20, source: 2, target: 10, data: {} },
        { id: 3, source: 1, target: 2, data: {} },
      ],
    });

    const reachable: readonly number[] = getReachableNodeIds(graph, 1);
    const order: readonly number[] | null = topologicalSort(graph);
    expect(graph.nodes.map(({ id }) => id)).toEqual([1, 2, 3, 10]);
    expect(graph.edges.map(({ id }) => id)).toEqual([3, 20]);
    expect(reachable).toEqual([2, 10]);
    expect(order).toEqual([1, 2, 3, 10]);
    expect(reverseGraph(graph).edges[0]?.source).toBe(2);
    expect(filterGraph(graph, { node: ({ id }) => id !== 2 }).edges).toEqual([]);
  });

  test('finds numeric cycles and preserves numeric path types', () => {
    const graph = createGraph({
      nodes: [10, 2, 1].map((id) => ({ id, data: {} })),
      edges: [
        { id: 30, source: 2, target: 10, data: {} },
        { id: 20, source: 10, target: 2, data: {} },
      ],
    });

    const cycle: readonly number[] | null = findCyclePath(graph, [2, 10]);
    expect(findStronglyConnectedComponents(graph)).toEqual([[1], [2, 10]]);
    expect(findCyclicComponents(graph)).toEqual([[2, 10]]);
    expect(cycle).toEqual([2, 10, 2]);
    expect(topologicalSort(graph)).toBeNull();
  });

  test('rejects invalid numeric identities', () => {
    expect(() => createGraph({ nodes: [{ id: Number.NaN, data: {} }], edges: [] })).toThrow(
      'safe integers',
    );
    expect(() =>
      createGraph({
        nodes: [{ id: 1, data: {} }],
        edges: [{ id: 1, source: 1, target: 2, data: {} }],
      }),
    ).toThrow('unknown endpoint');
  });
});
