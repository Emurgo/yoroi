export const filterBySearch = (searchTerm: string) => {
  const search = normalizeString(searchTerm)
  if (search.length === 0) return () => true

  return (asset: {ticker?: string; name?: string; symbol?: string}) => {
    const name = normalizeString(asset.name ?? '')
    const ticker = normalizeString(asset.ticker ?? '')
    const symbol = normalizeString(asset.symbol ?? '')

    return ticker.includes(search) || name.includes(search) || symbol.includes(search)
  }
}

const normalizeString = (str: string) => str.toLocaleLowerCase().replace(/\s/g, '')
