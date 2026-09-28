import type { Graph, GraphId } from '../../../types/graph.js';
import { compareGraphIds } from './compareGraphIds.js';
import { reverseGraph } from './reverseGraph.js';

/*** Return strongly connected components in deterministic node order. */
export function findStronglyConnectedComponents<
  NodeData,
  EdgeData,
  NodeId extends GraphId = string,
  EdgeId extends GraphId = NodeId,
>(graph: Graph<NodeData, EdgeData, NodeId, EdgeId>): readonly (readonly NodeId[])[] {
  const adjacency = buildAdjacency(graph);
  const finishOrder: NodeId[] = [];
  const visited = new Set<NodeId>();

  for (const nodeId of graph.nodes.map(({ id }) => id).sort(compareGraphIds)) {
    visitPostOrder(nodeId, adjacency, visited, finishOrder);
  }

  const reversedAdjacency = buildAdjacency(reverseGraph(graph));
  const assigned = new Set<NodeId>();
  const components: NodeId[][] = [];

  for (const nodeId of [...finishOrder].reverse()) {
    if (assigned.has(nodeId)) continue;
    const component: NodeId[] = [];
    collectComponent(nodeId, reversedAdjacency, assigned, component);
    components.push(component.sort(compareGraphIds));
  }

  return components.sort((left, right) => compareGraphIds(left[0] ?? '', right[0] ?? ''));
}

/*** Build sorted outgoing adjacency for graph traversal. */
function buildAdjacency<NodeData, EdgeData, NodeId extends GraphId, EdgeId extends GraphId>(
  graph: Graph<NodeData, EdgeData, NodeId, EdgeId>,
): Map<NodeId, NodeId[]> {
  const adjacency = new Map(graph.nodes.map(({ id }) => [id, [] as NodeId[]]));
  for (const edge of graph.edges) adjacency.get(edge.source)?.push(edge.target);
  for (const targets of adjacency.values()) targets.sort(compareGraphIds);
  return adjacency;
}

/*** Visit one node depth-first and append it after all descendants. */
function visitPostOrder<NodeId extends GraphId>(
  nodeId: NodeId,
  adjacency: ReadonlyMap<NodeId, readonly NodeId[]>,
  visited: Set<NodeId>,
  finishOrder: NodeId[],
): void {
  if (visited.has(nodeId)) return;
  visited.add(nodeId);
  for (const target of adjacency.get(nodeId) ?? []) {
    visitPostOrder(target, adjacency, visited, finishOrder);
  }
  finishOrder.push(nodeId);
}

/*** Collect one strongly connected component from reversed adjacency. */
function collectComponent<NodeId extends GraphId>(
  nodeId: NodeId,
  adjacency: ReadonlyMap<NodeId, readonly NodeId[]>,
  assigned: Set<NodeId>,
  component: NodeId[],
): void {
  if (assigned.has(nodeId)) return;
  assigned.add(nodeId);
  component.push(nodeId);
  for (const target of adjacency.get(nodeId) ?? []) {
    collectComponent(target, adjacency, assigned, component);
  }
}
