import type { Graph } from '../../../types/graph.js';
import { findStronglyConnectedComponents } from './findStronglyConnectedComponents.js';

/*** Return strongly connected components that represent graph cycles. */
export function findCyclicComponents<NodeData, EdgeData>(
  graph: Graph<NodeData, EdgeData>,
): readonly (readonly string[])[] {
  const selfLoops = new Set(
    graph.edges.filter((edge) => edge.source === edge.target).map((edge) => edge.source),
  );

  return findStronglyConnectedComponents(graph).filter(
    (component) =>
      component.length > 1 || (component[0] !== undefined && selfLoops.has(component[0])),
  );
}
