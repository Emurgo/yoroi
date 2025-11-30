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

export const groupBy = <T, K extends string | number | symbol>(
  list: T[],
  getKey: (item: T) => K,
) =>
  list.reduce(
    (previous, currentItem) => {
      const group = getKey(currentItem)
      if (!previous[group]) previous[group] = []
      previous[group].push(currentItem)
      return previous
    },
    {} as Record<K, T[]>,
  )

export const sliceArrayUntilItem = <T>(arr: T[], item: T): T[] => {
  const idx = arr.indexOf(item)
  if (idx !== -1) {
    return arr.slice(0, idx + 1)
  }
  return arr
}

export const removeItemFromArray = <T>(arr: T[], item: T): void => {
  const idx = arr.indexOf(item)
  if (idx !== -1) {
    arr.splice(idx, 1)
  }
}

export const chunk = <T>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

export const flatten = <T>(arr: T[][]): T[] => {
  return ([] as T[]).concat(...arr)
}

export const nonNullish = <T>(x: T | null | undefined): x is T => x != null
