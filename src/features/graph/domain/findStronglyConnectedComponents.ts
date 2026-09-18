import type { Graph } from '../../../types/graph.js';
import { reverseGraph } from './reverseGraph.js';

/*** Return strongly connected components in deterministic node order. */
export function findStronglyConnectedComponents<NodeData, EdgeData>(
  graph: Graph<NodeData, EdgeData>,
): readonly (readonly string[])[] {
  const adjacency = buildAdjacency(graph);
  const finishOrder: string[] = [];
  const visited = new Set<string>();

  for (const nodeId of graph.nodes.map(({ id }) => id).sort(compareText)) {
    visitPostOrder(nodeId, adjacency, visited, finishOrder);
  }

  const reversedAdjacency = buildAdjacency(reverseGraph(graph));
  const assigned = new Set<string>();
  const components: string[][] = [];

  for (const nodeId of [...finishOrder].reverse()) {
    if (assigned.has(nodeId)) continue;
    const component: string[] = [];
    collectComponent(nodeId, reversedAdjacency, assigned, component);
    components.push(component.sort(compareText));
  }

  return components.sort((left, right) => compareText(left[0] ?? '', right[0] ?? ''));
}

/*** Build sorted outgoing adjacency for graph traversal. */
function buildAdjacency<NodeData, EdgeData>(
  graph: Graph<NodeData, EdgeData>,
): Map<string, string[]> {
  const adjacency = new Map(graph.nodes.map(({ id }) => [id, [] as string[]]));
  for (const edge of graph.edges) adjacency.get(edge.source)?.push(edge.target);
  for (const targets of adjacency.values()) targets.sort(compareText);
  return adjacency;
}

/*** Visit one node depth-first and append it after all descendants. */
function visitPostOrder(
  nodeId: string,
  adjacency: ReadonlyMap<string, readonly string[]>,
  visited: Set<string>,
  finishOrder: string[],
): void {
  if (visited.has(nodeId)) return;
  visited.add(nodeId);
  for (const target of adjacency.get(nodeId) ?? []) {
    visitPostOrder(target, adjacency, visited, finishOrder);
  }
  finishOrder.push(nodeId);
}

/*** Collect one strongly connected component from reversed adjacency. */
function collectComponent(
  nodeId: string,
  adjacency: ReadonlyMap<string, readonly string[]>,
  assigned: Set<string>,
  component: string[],
): void {
  if (assigned.has(nodeId)) return;
  assigned.add(nodeId);
  component.push(nodeId);
  for (const target of adjacency.get(nodeId) ?? []) {
    collectComponent(target, adjacency, assigned, component);
  }
}

/*** Compare graph identities without locale-dependent ordering. */
function compareText(left: string, right: string): number {
  if (left < right) return -1;
  return left > right ? 1 : 0;
}
