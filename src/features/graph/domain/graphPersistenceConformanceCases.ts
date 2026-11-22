import type { GraphPersistenceConformanceCase } from '../../../types/persistence.js';

/*** The small provider-neutral behavioral contract for every graph persistence adapter. */
export const graphPersistenceConformanceCases: readonly GraphPersistenceConformanceCase[] = [
  {
    id: 'stable-edge-identity',
    requirement: 'An existing edge upsert rejects changed source, target, or type.',
  },
  {
    id: 'atomic-rollback',
    requirement: 'A failed mutate operation leaves every node and edge unchanged.',
  },
  {
    id: 'node-delete-safety',
    requirement:
      'Deleting a node with attached edges fails unless the same batch deletes those edges.',
  },
  {
    id: 'idempotent-mutation-count',
    requirement:
      'Replaying an unchanged mutation succeeds and reports zero state-changing mutations.',
  },
  {
    id: 'traversal-inclusion-and-order',
    requirement:
      'Traversal pages return unique stable-ID-ordered edges and every referenced endpoint node.',
  },
  {
    id: 'cursor-consistency',
    requirement: 'Every traversal page declares whether its cursor is snapshot-consistent or live.',
  },
];
