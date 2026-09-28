import type { Graph, GraphId } from '../../../types/graph.js';
import { compareGraphIds } from './compareGraphIds.js';

/*** Return deterministic reachable node IDs from one graph node. */
export function getReachableNodeIds<
  NodeData,
  EdgeData,
  NodeId extends GraphId = string,
  EdgeId extends GraphId = NodeId,
>(
  graph: Graph<NodeData, EdgeData, NodeId, EdgeId>,
  startId: NodeId,
  options: {
    readonly direction?: 'incoming' | 'outgoing';
    readonly includeStart?: boolean;
  } = {},
): readonly NodeId[] {
  const nodeIds = new Set(graph.nodes.map(({ id }) => id));
  if (!nodeIds.has(startId)) throw new Error(`Unknown graph node: ${startId}.`);

  const adjacency = buildAdjacency(graph, options.direction ?? 'outgoing');
  const visited = new Set<NodeId>();
  const pending = [...(adjacency.get(startId) ?? [])];

  while (pending.length > 0) {
    const nodeId = pending.shift();
    if (nodeId === undefined || visited.has(nodeId)) continue;
    visited.add(nodeId);
    pending.push(...(adjacency.get(nodeId) ?? []));
  }

  if (options.includeStart === true) visited.add(startId);
  else visited.delete(startId);

  return [...visited].sort(compareGraphIds);
}

/*** Build sorted graph adjacency in the requested direction. */
function buildAdjacency<NodeData, EdgeData, NodeId extends GraphId, EdgeId extends GraphId>(
  graph: Graph<NodeData, EdgeData, NodeId, EdgeId>,
  direction: 'incoming' | 'outgoing',
): Map<NodeId, NodeId[]> {
  const adjacency = new Map(graph.nodes.map(({ id }) => [id, [] as NodeId[]]));

  for (const edge of graph.edges) {
    const source = direction === 'outgoing' ? edge.source : edge.target;
    const target = direction === 'outgoing' ? edge.target : edge.source;
    adjacency.get(source)?.push(target);
  }

  for (const targets of adjacency.values()) targets.sort(compareGraphIds);
  return adjacency;
}
