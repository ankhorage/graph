# Public API

## createGraph

Kind: `function`
Module: `src/features/graph/domain/createGraph.ts`
Source: `src/features/graph/domain/createGraph.ts:5:1`

Create a deterministic graph and reject ambiguous or dangling identities.

### Signatures

- `(input: Graph<NodeData, EdgeData, NodeId, EdgeId>) => Graph<NodeData, EdgeData, NodeId, EdgeId>`
  - input: `Graph<NodeData, EdgeData, NodeId, EdgeId>`
  - returns: `Graph<NodeData, EdgeData, NodeId, EdgeId>`

## filterGraph

Kind: `function`
Module: `src/features/graph/domain/filterGraph.ts`
Source: `src/features/graph/domain/filterGraph.ts:5:1`

Project a graph by node and edge predicates while removing dangling edges.

### Signatures

- `(graph: Graph<NodeData, EdgeData, NodeId, EdgeId>, options: { readonly node?: (node: GraphNode<NodeData, NodeId>) => boolean; readonly edge?: (edge: GraphEdge<EdgeData, NodeId, EdgeId>) => boolean; }) => Graph<NodeData, EdgeData, NodeId, EdgeId>`
  - graph: `Graph<NodeData, EdgeData, NodeId, EdgeId>`
  - options: `{ readonly node?: (node: GraphNode<NodeData, NodeId>) => boolean; readonly edge?: (edge: GraphEdge<EdgeData, NodeId, EdgeId>) => boolean; }`
  - returns: `Graph<NodeData, EdgeData, NodeId, EdgeId>`

## findCyclePath

Kind: `function`
Module: `src/features/graph/domain/findCyclePath.ts`
Source: `src/features/graph/domain/findCyclePath.ts:5:1`

Return one closed cycle path, optionally restricted to a subset of graph nodes.

### Signatures

- `(graph: Graph<NodeData, EdgeData, NodeId, EdgeId>, nodeIds?: readonly NodeId[] | undefined) => readonly NodeId[] | null`
  - graph: `Graph<NodeData, EdgeData, NodeId, EdgeId>`
  - nodeIds: `readonly NodeId[] | undefined` (optional)
  - returns: `readonly NodeId[] | null`

## findCyclicComponents

Kind: `function`
Module: `src/features/graph/domain/findCyclicComponents.ts`
Source: `src/features/graph/domain/findCyclicComponents.ts:5:1`

Return strongly connected components that represent graph cycles.

### Signatures

- `(graph: Graph<NodeData, EdgeData, NodeId, EdgeId>) => readonly (readonly NodeId[])[]`
  - graph: `Graph<NodeData, EdgeData, NodeId, EdgeId>`
  - returns: `readonly (readonly NodeId[])[]`

## findStronglyConnectedComponents

Kind: `function`
Module: `src/features/graph/domain/findStronglyConnectedComponents.ts`
Source: `src/features/graph/domain/findStronglyConnectedComponents.ts:6:1`

Return strongly connected components in deterministic node order.

### Signatures

- `(graph: Graph<NodeData, EdgeData, NodeId, EdgeId>) => readonly (readonly NodeId[])[]`
  - graph: `Graph<NodeData, EdgeData, NodeId, EdgeId>`
  - returns: `readonly (readonly NodeId[])[]`

## getReachableNodeIds

Kind: `function`
Module: `src/features/graph/domain/getReachableNodeIds.ts`
Source: `src/features/graph/domain/getReachableNodeIds.ts:5:1`

Return deterministic reachable node IDs from one graph node.

### Signatures

- `(graph: Graph<NodeData, EdgeData, NodeId, EdgeId>, startId: NodeId, options?: { readonly direction?: "incoming" | "outgoing"; readonly includeStart?: boolean; }) => readonly NodeId[]`
  - graph: `Graph<NodeData, EdgeData, NodeId, EdgeId>`
  - options: `{ readonly direction?: "incoming" | "outgoing"; readonly includeStart?: boolean; }` (optional)
  - startId: `NodeId`
  - returns: `readonly NodeId[]`

## Graph

Kind: `type`
Module: `src/types/graph.ts`
Source: `src/types/graph.ts:19:1`

### Members

| Name  | Kind     | Type                                             | Required | Description |
| ----- | -------- | ------------------------------------------------ | -------- | ----------- |
| edges | property | `readonly GraphEdge<EdgeData, NodeId, EdgeId>[]` | yes      |             |
| nodes | property | `readonly GraphNode<NodeData, NodeId>[]`         | yes      |             |

## GraphEdge

Kind: `type`
Module: `src/types/graph.ts`
Source: `src/types/graph.ts:8:1`

### Members

| Name   | Kind     | Type       | Required | Description |
| ------ | -------- | ---------- | -------- | ----------- |
| data   | property | `EdgeData` | yes      |             |
| id     | property | `EdgeId`   | yes      |             |
| source | property | `NodeId`   | yes      |             |
| target | property | `NodeId`   | yes      |             |

## GraphId

Kind: `unknown`
Module: `src/types/graph.ts`
Source: `src/types/graph.ts:1:1`

## GraphNode

Kind: `type`
Module: `src/types/graph.ts`
Source: `src/types/graph.ts:3:1`

### Members

| Name | Kind     | Type       | Required | Description |
| ---- | -------- | ---------- | -------- | ----------- |
| data | property | `NodeData` | yes      |             |
| id   | property | `NodeId`   | yes      |             |

## reverseGraph

Kind: `function`
Module: `src/features/graph/domain/reverseGraph.ts`
Source: `src/features/graph/domain/reverseGraph.ts:5:1`

Reverse every directed edge while preserving identities and metadata.

### Signatures

- `(graph: Graph<NodeData, EdgeData, NodeId, EdgeId>) => Graph<NodeData, EdgeData, NodeId, EdgeId>`
  - graph: `Graph<NodeData, EdgeData, NodeId, EdgeId>`
  - returns: `Graph<NodeData, EdgeData, NodeId, EdgeId>`

## topologicalSort

Kind: `function`
Module: `src/features/graph/domain/topologicalSort.ts`
Source: `src/features/graph/domain/topologicalSort.ts:5:1`

Return a deterministic topological node order, or null when the graph is cyclic.

### Signatures

- `(graph: Graph<NodeData, EdgeData, NodeId, EdgeId>) => readonly NodeId[] | null`
  - graph: `Graph<NodeData, EdgeData, NodeId, EdgeId>`
  - returns: `readonly NodeId[] | null`
