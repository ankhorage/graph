export interface GraphNode<NodeData = unknown> {
  readonly id: string;
  readonly data: NodeData;
}

export interface GraphEdge<EdgeData = unknown> {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly data: EdgeData;
}

export interface Graph<NodeData = unknown, EdgeData = unknown> {
  readonly nodes: readonly GraphNode<NodeData>[];
  readonly edges: readonly GraphEdge<EdgeData>[];
}
