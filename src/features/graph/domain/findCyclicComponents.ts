import type { Graph, GraphId } from '../../../types/graph.js';
import { findStronglyConnectedComponents } from './findStronglyConnectedComponents.js';

/*** Return strongly connected components that represent graph cycles. */
export function findCyclicComponents<
  NodeData,
  EdgeData,
  NodeId extends GraphId = string,
  EdgeId extends GraphId = NodeId,
>(graph: Graph<NodeData, EdgeData, NodeId, EdgeId>): readonly (readonly NodeId[])[] {
  const selfLoops = new Set(
    graph.edges.filter((edge) => edge.source === edge.target).map((edge) => edge.source),
  );

  return findStronglyConnectedComponents(graph).filter(
    (component) =>
      component.length > 1 || (component[0] !== undefined && selfLoops.has(component[0])),
  );
}
