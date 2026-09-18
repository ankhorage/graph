import type { Graph, GraphEdge, GraphNode } from '../../../types/graph.js';
import { createGraph } from './createGraph.js';

/*** Project a graph by node and edge predicates while removing dangling edges. */
export function filterGraph<NodeData, EdgeData>(
  graph: Graph<NodeData, EdgeData>,
  options: {
    readonly node?: (node: GraphNode<NodeData>) => boolean;
    readonly edge?: (edge: GraphEdge<EdgeData>) => boolean;
  },
): Graph<NodeData, EdgeData> {
  const nodes = options.node === undefined ? graph.nodes : graph.nodes.filter(options.node);
  const nodeIds = new Set(nodes.map(({ id }) => id));
  const edges = graph.edges.filter(
    (edge) =>
      nodeIds.has(edge.source) &&
      nodeIds.has(edge.target) &&
      (options.edge === undefined || options.edge(edge)),
  );

  return createGraph({ nodes, edges });
}
