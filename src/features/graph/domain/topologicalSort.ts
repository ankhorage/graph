import type { Graph, GraphId } from '../../../types/graph.js';
import { compareGraphIds } from './compareGraphIds.js';

/*** Return a deterministic topological node order, or null when the graph is cyclic. */
export function topologicalSort<
  NodeData,
  EdgeData,
  NodeId extends GraphId = string,
  EdgeId extends GraphId = NodeId,
>(graph: Graph<NodeData, EdgeData, NodeId, EdgeId>): readonly NodeId[] | null {
  const inDegree = new Map(graph.nodes.map(({ id }) => [id, 0]));
  const outgoing = new Map(graph.nodes.map(({ id }) => [id, [] as NodeId[]]));

  for (const edge of graph.edges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    outgoing.get(edge.source)?.push(edge.target);
  }

  for (const targets of outgoing.values()) targets.sort(compareGraphIds);

  const ready = graph.nodes
    .map(({ id }) => id)
    .filter((id) => inDegree.get(id) === 0)
    .sort(compareGraphIds);
  const order: NodeId[] = [];

  while (ready.length > 0) {
    const nodeId = ready.shift();
    if (nodeId === undefined) continue;
    order.push(nodeId);

    for (const target of outgoing.get(nodeId) ?? []) {
      const nextDegree = (inDegree.get(target) ?? 0) - 1;
      inDegree.set(target, nextDegree);
      if (nextDegree === 0) {
        ready.push(target);
        ready.sort(compareGraphIds);
      }
    }
  }

  return order.length === graph.nodes.length ? order : null;
}
