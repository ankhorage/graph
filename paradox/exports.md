# Public API

## createGraph

Kind: `function`
Module: `src/features/graph/domain/createGraph.ts`
Source: `src/features/graph/domain/createGraph.ts:4:1`

Create a deterministic graph and reject ambiguous or dangling identities.

### Signatures

- `(input: Graph<NodeData, EdgeData>) => Graph<NodeData, EdgeData>`
  - input: `Graph<NodeData, EdgeData>`
  - returns: `Graph<NodeData, EdgeData>`

## filterGraph

Kind: `function`
Module: `src/features/graph/domain/filterGraph.ts`
Source: `src/features/graph/domain/filterGraph.ts:5:1`

Project a graph by node and edge predicates while removing dangling edges.

### Signatures

- `(graph: Graph<NodeData, EdgeData>, options: { readonly node?: (node: GraphNode<NodeData>) => boolean; readonly edge?: (edge: GraphEdge<EdgeData>) => boolean; }) => Graph<NodeData, EdgeData>`
  - graph: `Graph<NodeData, EdgeData>`
  - options: `{ readonly node?: (node: GraphNode<NodeData>) => boolean; readonly edge?: (edge: GraphEdge<EdgeData>) => boolean; }`
  - returns: `Graph<NodeData, EdgeData>`

## findCyclicComponents

Kind: `function`
Module: `src/features/graph/domain/findCyclicComponents.ts`
Source: `src/features/graph/domain/findCyclicComponents.ts:5:1`

Return strongly connected components that represent graph cycles.

### Signatures

- `(graph: Graph<NodeData, EdgeData>) => readonly (readonly string[])[]`
  - graph: `Graph<NodeData, EdgeData>`
  - returns: `readonly (readonly string[])[]`

## findStronglyConnectedComponents

Kind: `function`
Module: `src/features/graph/domain/findStronglyConnectedComponents.ts`
Source: `src/features/graph/domain/findStronglyConnectedComponents.ts:5:1`

Return strongly connected components in deterministic node order.

### Signatures

- `(graph: Graph<NodeData, EdgeData>) => readonly (readonly string[])[]`
  - graph: `Graph<NodeData, EdgeData>`
  - returns: `readonly (readonly string[])[]`

## getReachableNodeIds

Kind: `function`
Module: `src/features/graph/domain/getReachableNodeIds.ts`
Source: `src/features/graph/domain/getReachableNodeIds.ts:4:1`

Return deterministic reachable node IDs from one graph node.

### Signatures

- `(graph: Graph<NodeData, EdgeData>, startId: string, options?: { readonly direction?: "incoming" | "outgoing"; readonly includeStart?: boolean; }) => readonly string[]`
  - graph: `Graph<NodeData, EdgeData>`
  - options: `{ readonly direction?: "incoming" | "outgoing"; readonly includeStart?: boolean; }` (optional)
  - startId: `string`
  - returns: `readonly string[]`

## Graph

Kind: `type`
Module: `src/types/graph.ts`
Source: `src/types/graph.ts:13:1`

### Members

| Name  | Kind     | Type                             | Required | Description |
| ----- | -------- | -------------------------------- | -------- | ----------- |
| edges | property | `readonly GraphEdge<EdgeData>[]` | yes      |             |
| nodes | property | `readonly GraphNode<NodeData>[]` | yes      |             |

## GraphEdge

Kind: `type`
Module: `src/types/graph.ts`
Source: `src/types/graph.ts:6:1`

### Members

| Name   | Kind     | Type       | Required | Description |
| ------ | -------- | ---------- | -------- | ----------- |
| data   | property | `EdgeData` | yes      |             |
| id     | property | `string`   | yes      |             |
| source | property | `string`   | yes      |             |
| target | property | `string`   | yes      |             |

## GraphNode

Kind: `type`
Module: `src/types/graph.ts`
Source: `src/types/graph.ts:1:1`

### Members

| Name | Kind     | Type       | Required | Description |
| ---- | -------- | ---------- | -------- | ----------- |
| data | property | `NodeData` | yes      |             |
| id   | property | `string`   | yes      |             |

## reverseGraph

Kind: `function`
Module: `src/features/graph/domain/reverseGraph.ts`
Source: `src/features/graph/domain/reverseGraph.ts:5:1`

Reverse every directed edge while preserving identities and metadata.

### Signatures

- `(graph: Graph<NodeData, EdgeData>) => Graph<NodeData, EdgeData>`
  - graph: `Graph<NodeData, EdgeData>`
  - returns: `Graph<NodeData, EdgeData>`

## topologicalSort

Kind: `function`
Module: `src/features/graph/domain/topologicalSort.ts`
Source: `src/features/graph/domain/topologicalSort.ts:4:1`

Return a deterministic topological node order, or null when the graph is cyclic.

### Signatures

- `(graph: Graph<NodeData, EdgeData>) => readonly string[] | null`
  - graph: `Graph<NodeData, EdgeData>`
  - returns: `readonly string[] | null`
