import {TokenInfo} from '../../../yoroi-wallets/types'

export const filterBySearch = (searchTerm: string) => {
  const searchTermLowerCase = searchTerm.toLocaleLowerCase()
  if (searchTermLowerCase.length === 0) return () => true

  return (tokenInfo: TokenInfo) => {
    if (tokenInfo.kind === 'ft') {
      const name = tokenInfo.metadata.ticker?.toLocaleLowerCase() ?? tokenInfo.name?.toLocaleLowerCase() ?? null
      if (name) return name.toLowerCase().includes(searchTermLowerCase)
    }

    if (tokenInfo.kind === 'nft') {
      const name = tokenInfo.name?.toLocaleLowerCase() ?? null
      if (name) return name.toLowerCase().includes(searchTermLowerCase)
    }
    return false
  }
}
