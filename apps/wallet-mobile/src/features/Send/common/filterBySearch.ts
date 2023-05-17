import {TokenInfo} from '../../../yoroi-wallets/types'

export const filterBySearch = (searchTerm: string) => {
  const searchTermLowerCase = searchTerm.toLocaleLowerCase()
  if (searchTermLowerCase.length === 0) return () => true

  return (tokenInfo: TokenInfo) => {
    if (tokenInfo.kind === 'ft') {
      return (
        tokenInfo.ticker?.toLocaleLowerCase()?.includes(searchTermLowerCase) ||
        tokenInfo.name?.toLocaleLowerCase()?.includes(searchTermLowerCase)
      )
    }

    if (tokenInfo.kind === 'nft') {
      const name = tokenInfo.name?.toLocaleLowerCase() ?? null
      if (name) return name.toLowerCase().includes(searchTermLowerCase)
    }
    return false
  }
}
