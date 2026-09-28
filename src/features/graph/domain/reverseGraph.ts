import type { Graph, GraphId } from '../../../types/graph.js';
import { createGraph } from './createGraph.js';

/*** Reverse every directed edge while preserving identities and metadata. */
export function reverseGraph<
  NodeData,
  EdgeData,
  NodeId extends GraphId = string,
  EdgeId extends GraphId = NodeId,
>(graph: Graph<NodeData, EdgeData, NodeId, EdgeId>): Graph<NodeData, EdgeData, NodeId, EdgeId> {
  return createGraph({
    nodes: graph.nodes,
    edges: graph.edges.map((edge) => ({
      ...edge,
      source: edge.target,
      target: edge.source,
    })),
  });
}
