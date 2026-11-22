/*** Portable traversal limits that providers must enforce before issuing graph queries. */
export const graphPersistenceTraversalLimits = {
  maxDepth: 32,
  pageSize: 1_000,
} as const;
