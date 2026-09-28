import type { GraphId } from '../../../types/graph.js';

/*** Compare numeric identities numerically and text identities by stable code-unit order. */
export function compareGraphIds(left: GraphId, right: GraphId): number {
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  if (typeof left === 'number') return -1;
  if (typeof right === 'number') return 1;
  if (left < right) return -1;
  return left > right ? 1 : 0;
}
