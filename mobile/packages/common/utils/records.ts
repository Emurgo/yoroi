/**
 * Converts an array of [K,V] tuples into a { K -> V } record
 */
export function tuplesIntoRecord<K extends string | number | symbol, V>(
  tuples: Array<[K, V]>
): Record<K, V> {
  return tuples.reduce(
    (res, [k, v]) => ({...res, [k]: v}),
    {} as Record<K, V>
  )
}

/**
 * Merges an array of { K -> V } records into a single { K -> V } record
 */
export function mergeRecords<K extends string | number | symbol, V>(
  records: Array<Record<K, V>>
): Record<K, V> {
  return records.reduce(
    (res, record) => ({...res, ...record}),
    {} as Record<K, V>
  )
}

/**
 * Converts an array of T items into a { keyMapper(T) -> valueMapper(T) } record
 */
export function intoRecord<T, K extends string | number | symbol, V>(
  items: Array<T>,
  keyMapper: (item: T, index: number) => K,
  valueMapper: (item: T, index: number) => V
): Record<K, V> {
  return tuplesIntoRecord<K, V>(
    items.map((x, i) => [keyMapper(x, i), valueMapper(x, i)])
  )
}

/**
 * Converts an array of T items into a { keyMapper(T) -> T } record
 */
export function keyIntoRecord<K extends string | number | symbol, V>(
  values: Array<V>,
  keyMapper: (item: V, index: number) => K
): Record<K, V> {
  return intoRecord<V, K, V>(values, keyMapper, (x) => x)
}

/**
 * Converts an array of T items into a { T -> valueMapper(T) } record
 */
export function valueIntoRecord<K extends string | number | symbol, V>(
  keys: Array<K>,
  valueMapper: (key: K, index: number) => V
): Record<K, V> {
  return intoRecord<K, K, V>(keys, (x) => x, valueMapper)
}

