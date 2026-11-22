import type { GraphPersistenceOperation } from '../../../types/persistence.js';
import { graphPersistenceTraversalLimits } from '../constants/persistence.js';
import { assertGraphStorageData } from './assertGraphStorageData.js';

/*** Reject persistence operations that violate the portable graph storage contract. */
export function assertGraphPersistenceOperation(
  operation: unknown,
): asserts operation is GraphPersistenceOperation {
  if (!isRecord(operation)) throw new Error('Graph persistence operation is invalid.');
  if (operation.kind === 'mutate') {
    if (!Array.isArray(operation.mutations))
      throw new Error('Graph persistence mutations must be an array.');
    operation.mutations.forEach(assertMutation);
    return;
  }
  if (operation.kind === 'nodes') {
    if (!Array.isArray(operation.nodeIds))
      throw new Error('Graph persistence node IDs must be an array.');
    assertDistinctIdentifiers(operation.nodeIds, 'node IDs');
    return;
  }
  if (operation.kind !== 'traverse')
    throw new Error('Graph persistence operation kind is invalid.');
  assertTraversalOperation(operation);
}

/*** Validate one mutation before a provider starts its atomic transaction. */
function assertMutation(mutation: unknown): void {
  if (!isRecord(mutation)) throw new Error('Graph persistence mutation is invalid.');
  if (mutation.kind === 'upsertNode') return assertStoredGraphNode(mutation.node);
  if (mutation.kind === 'upsertEdge') return assertStoredGraphEdge(mutation.edge);
  if (mutation.kind === 'deleteNode') return assertIdentifier(mutation.nodeId, 'mutation ID');
  if (mutation.kind === 'deleteEdge') return assertIdentifier(mutation.edgeId, 'mutation ID');
  throw new Error('Graph persistence mutation kind is invalid.');
}

/*** Validate the stored-node refinement of the generic graph model. */
function assertStoredGraphNode(node: unknown): void {
  if (!isRecord(node) || !Array.isArray(node.labels))
    throw new Error('Stored graph node is invalid.');
  assertIdentifier(node.id, 'node ID');
  if (node.labels.length === 0) throw new Error('Stored graph nodes must have at least one label.');
  node.labels.forEach((label) => assertIdentifier(label, 'node label'));
  assertGraphStorageData(node.data);
}

/*** Validate the stored-edge refinement of the generic graph model. */
function assertStoredGraphEdge(edge: unknown): void {
  if (!isRecord(edge)) throw new Error('Stored graph edge is invalid.');
  assertIdentifier(edge.id, 'edge ID');
  assertIdentifier(edge.source, 'edge source');
  assertIdentifier(edge.target, 'edge target');
  assertIdentifier(edge.type, 'edge type');
  assertGraphStorageData(edge.data);
}

/*** Validate bounded traversal inputs before provider-specific execution. */
function assertTraversalOperation(operation: Record<string, unknown>): void {
  if (!Array.isArray(operation.startNodeIds) || typeof operation.direction !== 'string') {
    throw new Error('Graph persistence traversal is invalid.');
  }
  assertDistinctIdentifiers(operation.startNodeIds, 'traversal start node IDs');
  assertBoundedInteger(
    operation.maxDepth,
    'traversal maxDepth',
    0,
    graphPersistenceTraversalLimits.maxDepth,
  );
  assertBoundedInteger(
    operation.pageSize,
    'traversal pageSize',
    1,
    graphPersistenceTraversalLimits.pageSize,
  );
  if (operation.types !== undefined) {
    if (!Array.isArray(operation.types))
      throw new Error('Graph persistence traversal types must be an array.');
    assertDistinctIdentifiers(operation.types, 'traversal types');
  }
  if (operation.cursor !== undefined) assertIdentifier(operation.cursor, 'traversal cursor');
}

/*** Reject empty or duplicate values in an identifier collection. */
function assertDistinctIdentifiers(identifiers: readonly unknown[], kind: string): void {
  const seen = new Set<string>();
  for (const identifier of identifiers) {
    assertIdentifier(identifier, kind);
    if (seen.has(identifier))
      throw new Error(`Graph persistence ${kind} must be unique: ${identifier}.`);
    seen.add(identifier);
  }
}

/*** Reject empty identifiers in the strict string-only storage profile. */
function assertIdentifier(identifier: unknown, kind: string): asserts identifier is string {
  if (typeof identifier !== 'string' || identifier.trim() === '') {
    throw new Error(`Graph persistence ${kind} must be non-empty.`);
  }
}

/*** Reject unbounded numeric traversal controls. */
function assertBoundedInteger(
  value: unknown,
  kind: string,
  minimum: number,
  maximum: number,
): void {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < minimum ||
    value > maximum
  ) {
    throw new Error(
      `Graph persistence ${kind} must be a safe integer from ${minimum} through ${maximum}.`,
    );
  }
}

/*** Identify a plain mutable input record before validating its persistence fields. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
