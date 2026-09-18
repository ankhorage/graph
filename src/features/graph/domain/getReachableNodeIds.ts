import type { Graph } from '../../../types/graph.js';

/*** Return deterministic reachable node IDs from one graph node. */
export function getReachableNodeIds<NodeData, EdgeData>(
  graph: Graph<NodeData, EdgeData>,
  startId: string,
  options: {
    readonly direction?: 'incoming' | 'outgoing';
    readonly includeStart?: boolean;
  } = {},
): readonly string[] {
  const nodeIds = new Set(graph.nodes.map(({ id }) => id));
  if (!nodeIds.has(startId)) throw new Error(`Unknown graph node: ${startId}.`);

  const adjacency = buildAdjacency(graph, options.direction ?? 'outgoing');
  const visited = new Set<string>();
  const pending = [...(adjacency.get(startId) ?? [])];

  while (pending.length > 0) {
    const nodeId = pending.shift();
    if (nodeId === undefined || visited.has(nodeId)) continue;
    visited.add(nodeId);
    pending.push(...(adjacency.get(nodeId) ?? []));
  }

  if (options.includeStart === true) visited.add(startId);
  else visited.delete(startId);

  return [...visited].sort(compareText);
}

/*** Build sorted graph adjacency in the requested direction. */
function buildAdjacency<NodeData, EdgeData>(
  graph: Graph<NodeData, EdgeData>,
  direction: 'incoming' | 'outgoing',
): Map<string, string[]> {
  const adjacency = new Map(graph.nodes.map(({ id }) => [id, [] as string[]]));

  for (const edge of graph.edges) {
    const source = direction === 'outgoing' ? edge.source : edge.target;
    const target = direction === 'outgoing' ? edge.target : edge.source;
    adjacency.get(source)?.push(target);
  }

  for (const targets of adjacency.values()) targets.sort(compareText);
  return adjacency;
}

/*** Compare graph identities without locale-dependent ordering. */
function compareText(left: string, right: string): number {
  if (left < right) return -1;
  return left > right ? 1 : 0;
}
