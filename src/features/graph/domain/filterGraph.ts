import type { Graph, GraphEdge, GraphId, GraphNode } from '../../../types/graph.js';
import { createGraph } from './createGraph.js';

/*** Project a graph by node and edge predicates while removing dangling edges. */
export function filterGraph<
  NodeData,
  EdgeData,
  NodeId extends GraphId = string,
  EdgeId extends GraphId = NodeId,
>(
  graph: Graph<NodeData, EdgeData, NodeId, EdgeId>,
  options: {
    readonly node?: (node: GraphNode<NodeData, NodeId>) => boolean;
    readonly edge?: (edge: GraphEdge<EdgeData, NodeId, EdgeId>) => boolean;
  },
): Graph<NodeData, EdgeData, NodeId, EdgeId> {
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
