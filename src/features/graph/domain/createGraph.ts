import type { Graph } from '../../../types/graph.js';

/*** Create a deterministic graph and reject ambiguous or dangling identities. */
export function createGraph<NodeData, EdgeData>(
  input: Graph<NodeData, EdgeData>,
): Graph<NodeData, EdgeData> {
  const nodes = [...input.nodes].sort((left, right) => compareText(left.id, right.id));
  const edges = [...input.edges].sort((left, right) => compareText(left.id, right.id));

  assertUniqueIds(nodes.map(({ id }) => id), 'node');
  assertUniqueIds(edges.map(({ id }) => id), 'edge');

  const nodeIds = new Set(nodes.map(({ id }) => id));
  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      throw new Error(
        `Graph edge "${edge.id}" references an unknown endpoint: ${edge.source} -> ${edge.target}.`,
      );
    }
  }

  return { nodes, edges };
}

/*** Reject empty or duplicate graph identities. */
function assertUniqueIds(ids: readonly string[], kind: 'edge' | 'node'): void {
  const seen = new Set<string>();

  for (const id of ids) {
    if (id.trim() === '') throw new Error(`Graph ${kind} IDs must be non-empty.`);
    if (seen.has(id)) throw new Error(`Duplicate graph ${kind} ID: ${id}.`);
    seen.add(id);
  }
}

/*** Compare graph identities without locale-dependent ordering. */
function compareText(left: string, right: string): number {
  if (left < right) return -1;
  return left > right ? 1 : 0;
}
