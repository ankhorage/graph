import { expect, test } from 'bun:test';

import { assertGraphPersistenceOperation } from './assertGraphPersistenceOperation.js';
import { assertGraphStorageData } from './assertGraphStorageData.js';

test('graph persistence accepts canonical stored mutations', () => {
  expect(() =>
    assertGraphPersistenceOperation({
      kind: 'mutate',
      mutations: [
        {
          kind: 'upsertNode',
          node: {
            id: 'person-1',
            labels: ['Person'],
            data: {
              properties: { active: true, score: 3 },
              document: { profile: { name: 'Ada' }, tags: ['maintainer'] },
            },
          },
        },
        {
          kind: 'upsertEdge',
          edge: {
            id: 'role-1',
            source: 'person-1',
            target: 'person-1',
            type: 'HAS_ROLE',
            data: { properties: { validFrom: '2026-01-01' } },
          },
        },
      ],
    }),
  ).not.toThrow();
});

test('graph persistence accepts bounded traversals', () => {
  expect(() =>
    assertGraphPersistenceOperation({
      kind: 'traverse',
      startNodeIds: ['person-1'],
      direction: 'both',
      maxDepth: 2,
      pageSize: 25,
      types: ['HAS_ROLE'],
    }),
  ).not.toThrow();
});

test('graph persistence rejects non-portable storage values and invalid graph refinements', () => {
  expect(() =>
    assertGraphStorageData({ properties: { invalid: Number.POSITIVE_INFINITY } }),
  ).toThrow('finite numbers');
  expect(() =>
    assertGraphPersistenceOperation({
      kind: 'mutate',
      mutations: [
        {
          kind: 'upsertNode',
          node: { id: 'person-1', labels: [' '], data: { properties: {} } },
        },
      ],
    }),
  ).toThrow('node label');
  expect(() =>
    assertGraphPersistenceOperation({
      kind: 'mutate',
      mutations: [
        {
          kind: 'upsertEdge',
          edge: {
            id: 'edge-1',
            source: 'person-1',
            target: 'person-2',
            type: ' ',
            data: { properties: {} },
          },
        },
      ],
    }),
  ).toThrow('edge type');
});

test('graph persistence rejects ambiguous and unbounded lookup and traversal requests', () => {
  expect(() =>
    assertGraphPersistenceOperation({ kind: 'nodes', nodeIds: ['person-1', 'person-1'] }),
  ).toThrow('must be unique');
  expect(() =>
    assertGraphPersistenceOperation({
      kind: 'traverse',
      startNodeIds: ['person-1'],
      direction: 'outgoing',
      maxDepth: 1,
      pageSize: 0,
    }),
  ).toThrow('pageSize');
});
