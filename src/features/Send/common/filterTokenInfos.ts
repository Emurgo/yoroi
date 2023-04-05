import {TokenInfo} from '../../../yoroi-wallets'

export const filterTokenInfos = (searchTerm: string, tokenInfos: TokenInfo[]): TokenInfo[] => {
  const searchTermLowerCase = searchTerm.toLowerCase()
  return searchTermLowerCase.length > 0
    ? tokenInfos.filter((tokenInfo) => {
        const name = tokenInfo.ticker?.toLocaleLowerCase() ?? tokenInfo.name?.toLocaleLowerCase() ?? null
        if (name) return name.toLowerCase().includes(searchTermLowerCase)
        return false
      })
    : tokenInfos
}
