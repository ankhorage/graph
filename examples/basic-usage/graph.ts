import { createGraph, getReachableNodeIds, topologicalSort } from '@ankhorage/graph';

const graph = createGraph({
  nodes: [
    { id: 'studio', data: { label: 'Studio' } },
    { id: 'zora', data: { label: 'ZORA' } },
    { id: 'surface', data: { label: 'Surface' } },
  ],
  edges: [
    { id: 'studio-zora', source: 'studio', target: 'zora', data: {} },
    { id: 'zora-surface', source: 'zora', target: 'surface', data: {} },
  ],
});

console.log(getReachableNodeIds(graph, 'studio'));
console.log(topologicalSort(graph));
