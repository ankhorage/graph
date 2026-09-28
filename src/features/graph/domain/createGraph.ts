import type { Graph, GraphId } from '../../../types/graph.js';
import { compareGraphIds } from './compareGraphIds.js';

/*** Create a deterministic graph and reject ambiguous or dangling identities. */
export function createGraph<
  NodeData,
  EdgeData,
  NodeId extends GraphId = string,
  EdgeId extends GraphId = NodeId,
>(input: Graph<NodeData, EdgeData, NodeId, EdgeId>): Graph<NodeData, EdgeData, NodeId, EdgeId> {
  const nodes = [...input.nodes].sort((left, right) => compareGraphIds(left.id, right.id));
  const edges = [...input.edges].sort((left, right) => compareGraphIds(left.id, right.id));

  assertUniqueIds(
    nodes.map(({ id }) => id),
    'node',
  );
  assertUniqueIds(
    edges.map(({ id }) => id),
    'edge',
  );

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
function assertUniqueIds<Id extends GraphId>(ids: readonly Id[], kind: 'edge' | 'node'): void {
  const seen = new Set<Id>();

  for (const id of ids) {
    if (typeof id === 'string' && id.trim() === '') {
      throw new Error(`Graph ${kind} IDs must be non-empty.`);
    }
    if (typeof id === 'number' && !Number.isSafeInteger(id)) {
      throw new Error(`Graph ${kind} numeric IDs must be safe integers.`);
    }
    if (seen.has(id)) throw new Error(`Duplicate graph ${kind} ID: ${id}.`);
    seen.add(id);
  }
}
