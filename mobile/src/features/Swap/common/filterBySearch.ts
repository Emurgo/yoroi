const searchCache = new Map<string, string>()

export const filterBySearch = (searchTerm: string) => {
  if (searchTerm.length === 0) {
    return () => true
  }

  let normalizedSearch = searchCache.get(searchTerm)
  if (!normalizedSearch) {
    normalizedSearch = normalizeString(searchTerm)
    searchCache.set(searchTerm, normalizedSearch)
  }

  const filterFunction = (
    item: string | {ticker?: string; name?: string; symbol?: string},
  ) => {
    if (typeof item === 'string') return false

    const name = normalizeString(item.name ?? '')
    const ticker = normalizeString(item.ticker ?? '')
    const symbol = normalizeString(item.symbol ?? '')

    return (
      ticker.includes(normalizedSearch) ||
      name.includes(normalizedSearch) ||
      symbol.includes(normalizedSearch)
    )
  }

  return filterFunction
}

const normalizeString = (str: string) =>
  str.toLocaleLowerCase().replace(/\s/g, '')
