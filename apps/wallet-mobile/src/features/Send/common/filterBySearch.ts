import {TokenInfo} from '../../../yoroi-wallets/types'

export const filterBySearch = (searchTerm: string) => {
  const searchTermLowerCase = searchTerm.toLocaleLowerCase()
  if (searchTermLowerCase.length === 0) return () => true

  return (tokenInfo: TokenInfo) => {
    const name = tokenInfo.ticker?.toLocaleLowerCase() ?? tokenInfo.name?.toLocaleLowerCase() ?? null
    if (name !== null) return name.toLowerCase().includes(searchTermLowerCase)
    return false
  }
}
