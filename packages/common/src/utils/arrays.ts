export function difference<T = unknown>(
  a: ReadonlyArray<T>,
  b: ReadonlyArray<T>,
): ReadonlyArray<T> {
  const bSet = new Set<T>(b)
  return a.filter((value) => !bSet.has(value))
}

export function intersection<T = unknown>(
  a: ReadonlyArray<T>,
  b: ReadonlyArray<T>,
): ReadonlyArray<T> {
  const bSet = new Set<T>(b)
  return a.filter((value) => bSet.has(value))
}

// predicates
export function first() {
  return true
}
