import type {
  GraphJsonObject,
  GraphJsonValue,
  GraphScalar,
  GraphStorageData,
} from '../../../types/persistence.js';

/*** Reject storage data that cannot round-trip through the portable persistence profile. */
export function assertGraphStorageData(data: GraphStorageData): void {
  assertScalarRecord(data.properties, 'properties');
  if (data.document !== undefined) {
    assertJsonRecord(data.document, 'document', new WeakSet());
  }
}

/*** Validate a record that providers can filter and index without JSON coercion. */
function assertScalarRecord(record: Readonly<Record<string, GraphScalar>>, path: string): void {
  assertPlainRecord(record, path);
  for (const [key, value] of Object.entries(record)) {
    assertPropertyKey(key, path);
    assertScalar(value, `${path}.${key}`);
  }
}

/*** Validate a structured document while rejecting cyclic and non-JSON values. */
function assertJsonRecord(record: GraphJsonObject, path: string, ancestors: WeakSet<object>): void {
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
function assertJsonValue(value: GraphJsonValue, path: string, ancestors: WeakSet<object>): void {
  if (value === null) return;
  if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
    assertScalar(value, path);
    return;
  }
  if (isGraphJsonArray(value)) {
    if (ancestors.has(value)) throw new Error(`Graph storage ${path} must not contain cycles.`);
    ancestors.add(value);
    value.forEach((item, index) => assertJsonValue(item, `${path}[${index}]`, ancestors));
    ancestors.delete(value);
    return;
  }
  assertJsonRecord(value, path, ancestors);
}

/*** Identify a JSON array without widening readonly graph document values. */
function isGraphJsonArray(value: GraphJsonValue): value is readonly GraphJsonValue[] {
  return Array.isArray(value);
}

/*** Reject non-portable numeric values at the persistence boundary. */
function assertScalar(value: GraphScalar, path: string): void {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new Error(`Graph storage ${path} must contain finite numbers.`);
  }
}

/*** Restrict documents to JSON object records without prototype-dependent behavior. */
function assertPlainRecord(value: object, path: string): void {
  const prototype = Reflect.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error(`Graph storage ${path} must be a plain object.`);
  }
}

/*** Reject empty property keys because providers cannot portably index them. */
function assertPropertyKey(key: string, path: string): void {
  if (key.trim() === '')
    throw new Error(`Graph storage ${path} must not contain empty property keys.`);
}
