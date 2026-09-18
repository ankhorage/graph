import type { Graph } from '../../../types/graph.js';
import { createGraph } from './createGraph.js';

/*** Reverse every directed edge while preserving identities and metadata. */
export function reverseGraph<NodeData, EdgeData>(
  graph: Graph<NodeData, EdgeData>,
): Graph<NodeData, EdgeData> {
  return createGraph({
    nodes: graph.nodes,
    edges: graph.edges.map((edge) => ({
      ...edge,
      source: edge.target,
      target: edge.source,
    })),
  });
}
