import type { Graph } from '../../../types/graph.js';

/*** Return one closed cycle path, optionally restricted to a subset of graph nodes. */
export function findCyclePath<NodeData, EdgeData>(
  graph: Graph<NodeData, EdgeData>,
  nodeIds?: readonly string[],
): readonly string[] | null {
  const allowedNodeIds = new Set(nodeIds ?? graph.nodes.map(({ id }) => id));
  const graphNodeIds = new Set(graph.nodes.map(({ id }) => id));
  const starts = graph.nodes
    .map(({ id }) => id)
    .filter((id) => allowedNodeIds.has(id))
    .sort(compareText);
  const adjacency = buildAdjacency(graph, graphNodeIds, allowedNodeIds);

  for (const start of starts) {
    const cycle = findCycleFromStart(start, adjacency);
    if (cycle !== null) return cycle;
  }

  return null;
}

/*** Build stable outgoing adjacency while honoring the requested node subset. */
function buildAdjacency<NodeData, EdgeData>(
  graph: Graph<NodeData, EdgeData>,
  graphNodeIds: ReadonlySet<string>,
  allowedNodeIds: ReadonlySet<string>,
): ReadonlyMap<string, readonly string[]> {
  const adjacency = new Map(
    graph.nodes
      .map(({ id }) => id)
      .filter((id) => allowedNodeIds.has(id))
      .map((id) => [id, [] as string[]]),
  );

  for (const edge of graph.edges) {
    if (
      graphNodeIds.has(edge.source) &&
      graphNodeIds.has(edge.target) &&
      allowedNodeIds.has(edge.source) &&
      allowedNodeIds.has(edge.target)
    ) {
      adjacency.get(edge.source)?.push(edge.target);
    }
  }

  return adjacency;
}

/*** Search one deterministic simple cycle that closes back onto the selected start node. */
function findCycleFromStart(
  start: string,
  adjacency: ReadonlyMap<string, readonly string[]>,
): readonly string[] | null {
  return visitCycle(start, start, adjacency, [], new Set<string>());
}

/*** Traverse one simple path until it closes back onto the cycle start. */
function visitCycle(
  start: string,
  nodeId: string,
  adjacency: ReadonlyMap<string, readonly string[]>,
  path: readonly string[],
  visited: ReadonlySet<string>,
): readonly string[] | null {
  const nextPath = [...path, nodeId];
  const nextVisited = new Set(visited).add(nodeId);

  for (const target of adjacency.get(nodeId) ?? []) {
    if (target === start) return [...nextPath, start];
    if (nextVisited.has(target)) continue;

    const cycle = visitCycle(start, target, adjacency, nextPath, nextVisited);
    if (cycle !== null) return cycle;
  }

  return null;
}

/*** Compare graph identities without locale-dependent ordering. */
function compareText(left: string, right: string): number {
  if (left < right) return -1;
  return left > right ? 1 : 0;
}
