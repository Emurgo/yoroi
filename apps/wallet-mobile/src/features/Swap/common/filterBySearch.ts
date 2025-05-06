export const filterBySearch = (searchTerm: string) => {
  const search = normalizeString(searchTerm)
  if (search.length === 0) return () => true

  return (item: string | {ticker?: string; name?: string; symbol?: string}) => {
    if (typeof item === 'string') return false

    const name = normalizeString(item.name ?? '')
    const ticker = normalizeString(item.ticker ?? '')
    const symbol = normalizeString(item.symbol ?? '')

    return ticker.includes(search) || name.includes(search) || symbol.includes(search)
  }
}

const normalizeString = (str: string) => str.toLocaleLowerCase().replace(/\s/g, '')
