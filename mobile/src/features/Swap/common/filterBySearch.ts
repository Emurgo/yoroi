const MAX_CACHE_SIZE = 100
const searchCache = new Map<string, string>()

export const filterBySearch = (searchTerm: string) => {
  const normalizedSearch = normalizeString(searchTerm)

  if (normalizedSearch.length === 0) {
    return () => true
  }

  let cachedSearch = searchCache.get(normalizedSearch)
  if (!cachedSearch) {
    if (searchCache.size >= MAX_CACHE_SIZE) {
      const firstKey = searchCache.keys().next().value
      if (firstKey !== undefined) {
        searchCache.delete(firstKey)
      }
    }

    cachedSearch = normalizedSearch
    searchCache.set(normalizedSearch, cachedSearch)
  }

  const filterFunction = (
    item: string | {ticker?: string; name?: string; symbol?: string},
  ) => {
    if (typeof item === 'string') return false

    const name = normalizeString(item.name ?? '')
    const ticker = normalizeString(item.ticker ?? '')
    const symbol = normalizeString(item.symbol ?? '')

    return (
      ticker.includes(cachedSearch) ||
      name.includes(cachedSearch) ||
      symbol.includes(cachedSearch)
    )
  }

  return filterFunction
}

const normalizeString = (str: string) =>
  str.toLocaleLowerCase().replace(/\s/g, '')
