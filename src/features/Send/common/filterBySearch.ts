import {TokenInfo} from '../../../yoroi-wallets'

export const filterBySearch = (searchTerm: string) => {
  const searchTermLowerCase = searchTerm.toLowerCase()
  if (searchTermLowerCase.length === 0) return () => true

  return (tokenInfo: TokenInfo) => {
    const name = tokenInfo.ticker?.toLocaleLowerCase() ?? tokenInfo.name?.toLocaleLowerCase() ?? null
    if (name !== null) return name.toLowerCase().includes(searchTermLowerCase)
    return false
  }
}
