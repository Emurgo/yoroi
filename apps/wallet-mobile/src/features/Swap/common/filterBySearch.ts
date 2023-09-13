import {Balance} from '@yoroi/types'

export const filterBySearch = (searchTerm: string) => {
  const search = normalizeString(searchTerm)
  if (search.length === 0) return () => true

  return (tokenInfo: Balance.TokenInfo) => {
    if (tokenInfo.kind === 'ft') {
      const ticker = normalizeString(tokenInfo.ticker ?? '')
      const name = normalizeString(tokenInfo.name ?? '')
      return ticker.includes(search) || name.includes(search)
    }

    if (tokenInfo.kind === 'nft') {
      const name = normalizeString(tokenInfo.name ?? '')
      return name.includes(search)
    }
    return false
  }
}

const normalizeString = (str: string) => str.toLocaleLowerCase().replace(/\s/g, '')
