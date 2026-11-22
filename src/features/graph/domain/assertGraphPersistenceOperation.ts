import type {
  GraphPersistenceMutation,
  GraphPersistenceOperation,
  GraphPersistenceTraversalOperation,
  StoredGraphEdge,
  StoredGraphNode,
} from '../../../types/persistence.js';
import { assertGraphStorageData } from './assertGraphStorageData.js';

/*** Reject persistence operations that violate the portable graph storage contract. */
export function assertGraphPersistenceOperation(operation: GraphPersistenceOperation): void {
  if (operation.kind === 'mutate') {
    operation.mutations.forEach(assertMutation);
    return;
  }
  if (operation.kind === 'nodes') {
    assertDistinctIdentifiers(operation.nodeIds, 'node IDs');
    return;
  }
  assertTraversalOperation(operation);
}

/*** Validate one mutation before a provider starts its atomic transaction. */
function assertMutation(mutation: GraphPersistenceMutation): void {
  if (mutation.kind === 'upsertNode') return assertStoredGraphNode(mutation.node);
  if (mutation.kind === 'upsertEdge') return assertStoredGraphEdge(mutation.edge);
  assertIdentifier(
    mutation.kind === 'deleteNode' ? mutation.nodeId : mutation.edgeId,
    'mutation ID',
  );
}

/*** Validate the stored-node refinement of the generic graph model. */
function assertStoredGraphNode(node: StoredGraphNode): void {
  assertIdentifier(node.id, 'node ID');
  if (node.labels.length === 0) throw new Error('Stored graph nodes must have at least one label.');
  node.labels.forEach((label) => assertIdentifier(label, 'node label'));
  assertGraphStorageData(node.data);
}

/*** Validate the stored-edge refinement of the generic graph model. */
function assertStoredGraphEdge(edge: StoredGraphEdge): void {
  assertIdentifier(edge.id, 'edge ID');
  assertIdentifier(edge.source, 'edge source');
  assertIdentifier(edge.target, 'edge target');
  assertIdentifier(edge.type, 'edge type');
  assertGraphStorageData(edge.data);
}

/*** Validate bounded traversal inputs before provider-specific execution. */
function assertTraversalOperation(operation: GraphPersistenceTraversalOperation): void {
  assertDistinctIdentifiers(operation.startNodeIds, 'traversal start node IDs');
  assertBoundedInteger(operation.maxDepth, 'traversal maxDepth', true);
  assertBoundedInteger(operation.pageSize, 'traversal pageSize', false);
  if (operation.types !== undefined) assertDistinctIdentifiers(operation.types, 'traversal types');
  if (operation.cursor !== undefined) assertIdentifier(operation.cursor, 'traversal cursor');
}

/*** Reject empty or duplicate values in an identifier collection. */
function assertDistinctIdentifiers(identifiers: readonly string[], kind: string): void {
  const seen = new Set<string>();
  for (const identifier of identifiers) {
    assertIdentifier(identifier, kind);
    if (seen.has(identifier))
      throw new Error(`Graph persistence ${kind} must be unique: ${identifier}.`);
    seen.add(identifier);
  }
}

/*** Reject empty identifiers in the strict string-only storage profile. */
function assertIdentifier(identifier: string, kind: string): void {
  if (identifier.trim() === '') throw new Error(`Graph persistence ${kind} must be non-empty.`);
}

/*** Reject unbounded numeric traversal controls. */
function assertBoundedInteger(value: number, kind: string, acceptsZero: boolean): void {
  const minimum = acceptsZero ? 0 : 1;
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new Error(`Graph persistence ${kind} must be a safe integer of at least ${minimum}.`);
  }
}
