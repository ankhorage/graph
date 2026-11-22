import { expect, test } from 'bun:test';

import { graphPersistenceTraversalLimits } from '../constants/persistence.js';
import { assertGraphPersistenceOperation } from './assertGraphPersistenceOperation.js';
import { assertGraphStorageData } from './assertGraphStorageData.js';
import { graphPersistenceConformanceCases } from './graphPersistenceConformanceCases.js';

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
    assertGraphStorageData(JSON.parse('{"properties":{"role":{"nested":true},"validTo":null}}')),
  ).toThrow('string, boolean, or finite number');
  expect(() =>
    assertGraphStorageData({ properties: {}, document: { sparse: new Array(2) } }),
  ).toThrow('sparse or extended arrays');
  expect(() =>
    assertGraphStorageData({ properties: {}, document: { [Symbol('hidden')]: 'value' } }),
  ).toThrow('enumerable string keys');
  const documentWithHiddenProperty = { visible: 'value' };
  Object.defineProperty(documentWithHiddenProperty, 'hidden', { value: 'value' });
  expect(() =>
    assertGraphStorageData({ properties: {}, document: documentWithHiddenProperty }),
  ).toThrow('enumerable string keys');
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
  expect(() => assertGraphPersistenceOperation({ kind: 'mutate', mutations: null })).toThrow(
    'mutations must be an array',
  );
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
  expect(() =>
    assertGraphPersistenceOperation({
      kind: 'traverse',
      startNodeIds: ['person-1'],
      direction: 'outgoing',
      maxDepth: graphPersistenceTraversalLimits.maxDepth + 1,
      pageSize: graphPersistenceTraversalLimits.pageSize + 1,
    }),
  ).toThrow('maxDepth');
  expect(() =>
    assertGraphPersistenceOperation({
      kind: 'traverse',
      startNodeIds: ['person-1'],
      direction: 'sideways',
      maxDepth: 1,
      pageSize: 1,
    }),
  ).toThrow('traversal is invalid');
  expect(() =>
    assertGraphPersistenceOperation({
      kind: 'traverse',
      startNodeIds: ['person-1'],
      direction: 1,
      maxDepth: 1,
      pageSize: 1,
    }),
  ).toThrow('traversal is invalid');
});

test('graph persistence publishes adapter conformance requirements without claiming provider execution', () => {
  expect(graphPersistenceConformanceCases.map(({ id }) => id)).toEqual([
    'stable-edge-identity',
    'atomic-rollback',
    'node-delete-safety',
    'idempotent-mutation-count',
    'traversal-inclusion-and-order',
    'cursor-consistency',
  ]);
});
