import type { Graph, GraphEdge, GraphNode } from './graph.js';

/*** A scalar that can be stored and compared natively by a graph provider. */
export type GraphScalar = boolean | number | string;

/*** A lossless JSON-compatible value for optional structured graph data. */
export type GraphJsonValue = GraphScalar | null | readonly GraphJsonValue[] | GraphJsonObject;

/*** A JSON object that preserves named structured graph data without encoding collisions. */
export interface GraphJsonObject {
  readonly [key: string]: GraphJsonValue;
}

/*** Native filterable properties and optional structured document data for one stored element. */
export interface GraphStorageData {
  readonly properties: Readonly<Record<string, GraphScalar>>;
  readonly document?: GraphJsonObject;
}

/*** A durable graph node with a non-empty label set. */
export interface StoredGraphNode extends GraphNode<GraphStorageData> {
  readonly labels: readonly [string, ...string[]];
}

/*** A durable directed relationship with a non-empty type. */
export interface StoredGraphEdge extends GraphEdge<GraphStorageData, string, string> {
  readonly type: string;
}

/*** A persisted graph snapshot represented through the canonical graph model. */
export interface StoredGraph extends Graph<GraphStorageData, GraphStorageData> {
  readonly nodes: readonly StoredGraphNode[];
  readonly edges: readonly StoredGraphEdge[];
}

/*** An operation capability that a persistence session may expose. */
export type GraphPersistenceCapability = 'mutate' | 'nodes' | 'traverse';

/*** One change within an atomic graph mutation. */
export type GraphPersistenceMutation =
  | { readonly kind: 'upsertNode'; readonly node: StoredGraphNode }
  | { readonly kind: 'deleteNode'; readonly nodeId: string }
  | { readonly kind: 'upsertEdge'; readonly edge: StoredGraphEdge }
  | { readonly kind: 'deleteEdge'; readonly edgeId: string };

/***
 * An all-or-nothing ordered sequence of graph mutations. Upserts are idempotent; an edge upsert
 * must not silently change an existing edge's endpoints or type. Deleting a node with attached
 * edges must fail unless those edges are deleted by the same batch.
 */
export interface GraphPersistenceMutationOperation {
  readonly kind: 'mutate';
  readonly mutations: readonly GraphPersistenceMutation[];
}

/*** A direct lookup of durable graph nodes by their stable identifiers. */
export interface GraphPersistenceNodesOperation {
  readonly kind: 'nodes';
  readonly nodeIds: readonly string[];
}

/*** The direction in which a graph traversal expands paths. */
export type GraphTraversalDirection = 'incoming' | 'outgoing' | 'both';

/*** A bounded graph traversal request with an opaque provider cursor. */
export interface GraphPersistenceTraversalOperation {
  readonly kind: 'traverse';
  readonly startNodeIds: readonly string[];
  readonly direction: GraphTraversalDirection;
  readonly maxDepth: number;
  readonly pageSize: number;
  readonly types?: readonly string[];
  readonly cursor?: string;
}

/*** One provider-neutral persistence operation. */
export type GraphPersistenceOperation =
  | GraphPersistenceMutationOperation
  | GraphPersistenceNodesOperation
  | GraphPersistenceTraversalOperation;

/***
 * The receipt for a committed atomic mutation. `mutationCount` is the number of individual
 * mutations that changed persisted state; replaying an already-applied mutation therefore counts
 * as zero.
 */
export interface GraphPersistenceMutationResult {
  readonly kind: 'mutated';
  readonly mutationCount: number;
}

/*** The result of a direct node lookup; unknown identifiers are omitted. */
export interface GraphPersistenceNodesResult {
  readonly kind: 'nodes';
  readonly nodes: readonly StoredGraphNode[];
}

/***
 * One deterministic bounded traversal page. Edges must be unique and ordered by stable edge ID;
 * included nodes must cover their endpoints. `cursorConsistency` makes the provider's page-to-page
 * consistency boundary explicit.
 */
export interface GraphPersistenceTraversalResult {
  readonly kind: 'traversal';
  readonly nodes: readonly StoredGraphNode[];
  readonly edges: readonly StoredGraphEdge[];
  readonly cursorConsistency: 'live' | 'snapshot';
  readonly nextCursor?: string;
}

/*** The explicit response for an operation whose session capability is genuinely unavailable. */
export interface GraphPersistenceUnsupportedResult {
  readonly kind: 'unsupported';
  readonly capability: GraphPersistenceCapability;
}

/*** The result of executing a provider-neutral persistence operation. */
export type GraphPersistenceResult =
  | GraphPersistenceMutationResult
  | GraphPersistenceNodesResult
  | GraphPersistenceTraversalResult
  | GraphPersistenceUnsupportedResult;

/***
 * A live persistence session with explicit capability discovery and lifecycle. Implementations
 * must commit every `mutate` batch atomically or roll it back entirely; `unsupported` cannot
 * represent a partial commit.
 */
export interface GraphPersistenceSession {
  readonly capabilities: readonly GraphPersistenceCapability[];
  executeAsync(operation: GraphPersistenceOperation): Promise<GraphPersistenceResult>;
  closeAsync(): Promise<void>;
}

/*** The provider-neutral boundary that opens durable graph persistence sessions. */
export interface GraphPersistencePort {
  openAsync(): Promise<GraphPersistenceSession>;
}
