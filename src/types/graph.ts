export type GraphId = number | string;

export interface GraphNode<NodeData = unknown, NodeId extends GraphId = string> {
  readonly id: NodeId;
  readonly data: NodeData;
}

export interface GraphEdge<
  EdgeData = unknown,
  NodeId extends GraphId = string,
  EdgeId extends GraphId = NodeId,
> {
  readonly id: EdgeId;
  readonly source: NodeId;
  readonly target: NodeId;
  readonly data: EdgeData;
}

export interface Graph<
  NodeData = unknown,
  EdgeData = unknown,
  NodeId extends GraphId = string,
  EdgeId extends GraphId = NodeId,
> {
  readonly nodes: readonly GraphNode<NodeData, NodeId>[];
  readonly edges: readonly GraphEdge<EdgeData, NodeId, EdgeId>[];
}
