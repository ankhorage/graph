import type { Graph } from '../../../types/graph.js';

/*** Return a deterministic topological node order, or null when the graph is cyclic. */
export function topologicalSort<NodeData, EdgeData>(
  graph: Graph<NodeData, EdgeData>,
): readonly string[] | null {
  const inDegree = new Map(graph.nodes.map(({ id }) => [id, 0]));
  const outgoing = new Map(graph.nodes.map(({ id }) => [id, [] as string[]]));

  for (const edge of graph.edges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    outgoing.get(edge.source)?.push(edge.target);
  }

  for (const targets of outgoing.values()) targets.sort(compareText);

  const ready = graph.nodes
    .map(({ id }) => id)
    .filter((id) => inDegree.get(id) === 0)
    .sort(compareText);
  const order: string[] = [];

  while (ready.length > 0) {
    const nodeId = ready.shift();
    if (nodeId === undefined) continue;
    order.push(nodeId);

    for (const target of outgoing.get(nodeId) ?? []) {
      const nextDegree = (inDegree.get(target) ?? 0) - 1;
      inDegree.set(target, nextDegree);
      if (nextDegree === 0) {
        ready.push(target);
        ready.sort(compareText);
      }
    }
  }

  return order.length === graph.nodes.length ? order : null;
}

/*** Compare graph identities without locale-dependent ordering. */
function compareText(left: string, right: string): number {
  if (left < right) return -1;
  return left > right ? 1 : 0;
}
