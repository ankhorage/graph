import type { Graph, GraphId } from '../../../types/graph.js';
import { compareGraphIds } from './compareGraphIds.js';

/*** Return one closed cycle path, optionally restricted to a subset of graph nodes. */
export function findCyclePath<
  NodeData,
  EdgeData,
  NodeId extends GraphId = string,
  EdgeId extends GraphId = NodeId,
>(
  graph: Graph<NodeData, EdgeData, NodeId, EdgeId>,
  nodeIds?: readonly NodeId[],
): readonly NodeId[] | null {
  const allowedNodeIds = new Set(nodeIds ?? graph.nodes.map(({ id }) => id));
  const graphNodeIds = new Set(graph.nodes.map(({ id }) => id));
  const starts = graph.nodes
    .map(({ id }) => id)
    .filter((id) => allowedNodeIds.has(id))
    .sort(compareGraphIds);
  const adjacency = buildAdjacency(graph, graphNodeIds, allowedNodeIds);

  for (const start of starts) {
    const cycle = findCycleFromStart(start, adjacency);
    if (cycle !== null) return cycle;
  }

  return null;
}

/*** Build stable outgoing adjacency while honoring the requested node subset. */
function buildAdjacency<NodeData, EdgeData, NodeId extends GraphId, EdgeId extends GraphId>(
  graph: Graph<NodeData, EdgeData, NodeId, EdgeId>,
  graphNodeIds: ReadonlySet<NodeId>,
  allowedNodeIds: ReadonlySet<NodeId>,
): ReadonlyMap<NodeId, readonly NodeId[]> {
  const adjacency = new Map(
    graph.nodes
      .map(({ id }) => id)
      .filter((id) => allowedNodeIds.has(id))
      .map((id) => [id, [] as NodeId[]]),
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

  for (const targets of adjacency.values()) targets.sort(compareGraphIds);

  return adjacency;
}

/*** Search one deterministic simple cycle that closes back onto the selected start node. */
function findCycleFromStart<NodeId extends GraphId>(
  start: NodeId,
  adjacency: ReadonlyMap<NodeId, readonly NodeId[]>,
): readonly NodeId[] | null {
  return visitCycle(start, start, adjacency, [], new Set<NodeId>());
}

/*** Traverse one simple path until it closes back onto the cycle start. */
function visitCycle<NodeId extends GraphId>(
  start: NodeId,
  nodeId: NodeId,
  adjacency: ReadonlyMap<NodeId, readonly NodeId[]>,
  path: readonly NodeId[],
  visited: ReadonlySet<NodeId>,
): readonly NodeId[] | null {
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
