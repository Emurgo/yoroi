import {Balance} from '@yoroi/types'

export const filterBySearch = (searchTerm: string) => {
  const searchTermLowerCase = searchTerm.toLocaleLowerCase()
  if (searchTermLowerCase.length === 0) return () => true

  return (tokenInfo: Balance.TokenInfo) => {
    if (tokenInfo.kind === 'ft') {
      return (
        (tokenInfo.ticker?.toLocaleLowerCase()?.includes(searchTermLowerCase) ||
          tokenInfo.name?.toLocaleLowerCase()?.includes(searchTermLowerCase)) ??
        false
      )
    }

    if (tokenInfo.kind === 'nft') {
      return tokenInfo.name?.toLocaleLowerCase().includes(searchTermLowerCase) ?? false
    }
    return false
  }
}
