import type { GraphScalar, GraphStorageData } from '../../../types/persistence.js';

/*** Reject storage data that cannot round-trip through the portable persistence profile. */
export function assertGraphStorageData(data: unknown): asserts data is GraphStorageData {
  assertPlainRecord(data, 'storage data');
  assertScalarRecord(data.properties, 'properties');
  if (data.document !== undefined) {
    assertJsonRecord(data.document, 'document', new WeakSet());
  }
}

/*** Validate a record that providers can filter and index without JSON coercion. */
function assertScalarRecord(record: unknown, path: string): void {
  assertPlainRecord(record, path);
  for (const [key, value] of Object.entries(record)) {
    assertPropertyKey(key, path);
    assertScalar(value, `${path}.${key}`);
  }
}

/*** Validate a structured document while rejecting cyclic and non-JSON values. */
function assertJsonRecord(record: unknown, path: string, ancestors: WeakSet<object>): void {
  assertPlainRecord(record, path);
  if (ancestors.has(record)) throw new Error(`Graph storage ${path} must not contain cycles.`);
  ancestors.add(record);
  for (const [key, value] of Object.entries(record)) {
    assertPropertyKey(key, path);
    assertJsonValue(value, `${path}.${key}`, ancestors);
  }
  ancestors.delete(record);
}

/*** Validate one lossless JSON-compatible graph document value. */
function assertJsonValue(value: unknown, path: string, ancestors: WeakSet<object>): void {
  if (value === null) return;
  if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
    assertScalar(value, path);
    return;
  }
  if (isGraphJsonArray(value)) {
    if (ancestors.has(value)) throw new Error(`Graph storage ${path} must not contain cycles.`);
    ancestors.add(value);
    assertDenseJsonArray(value, path);
    value.forEach((item, index) => assertJsonValue(item, `${path}[${index}]`, ancestors));
    ancestors.delete(value);
    return;
  }
  assertJsonRecord(value, path, ancestors);
}

/*** Identify a JSON array without widening readonly graph document values. */
function isGraphJsonArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

/*** Reject non-portable numeric values at the persistence boundary. */
function assertScalar(value: unknown, path: string): asserts value is GraphScalar {
  if (typeof value !== 'string' && typeof value !== 'boolean' && typeof value !== 'number') {
    throw new Error(`Graph storage ${path} must contain a string, boolean, or finite number.`);
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new Error(`Graph storage ${path} must contain finite numbers.`);
  }
}

/*** Restrict documents to JSON object records without prototype-dependent behavior. */
function assertPlainRecord(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Graph storage ${path} must be a plain object.`);
  }
  const prototype = Reflect.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error(`Graph storage ${path} must be a plain object.`);
  }
  if (
    Reflect.ownKeys(value).some(
      (key) => typeof key !== 'string' || !Object.prototype.propertyIsEnumerable.call(value, key),
    )
  ) {
    throw new Error(`Graph storage ${path} must contain only enumerable string keys.`);
  }
}

/*** Reject JSON array holes and extra own properties that JSON cannot round-trip losslessly. */
function assertDenseJsonArray(value: readonly unknown[], path: string): void {
  const expectedKeys = new Set([
    ...Array.from({ length: value.length }, (_, index) => String(index)),
    'length',
  ]);
  const keys = Reflect.ownKeys(value);
  if (keys.length !== expectedKeys.size || keys.some((key) => !expectedKeys.has(String(key)))) {
    throw new Error(`Graph storage ${path} must not contain sparse or extended arrays.`);
  }
}

/*** Reject empty property keys because providers cannot portably index them. */
function assertPropertyKey(key: string, path: string): void {
  if (key.trim() === '')
    throw new Error(`Graph storage ${path} must not contain empty property keys.`);
}
