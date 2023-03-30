import {TokenInfo} from '../../../../../yoroi-wallets'

export const filterAssets = (assetSearchTerm: string, tokenInfos: TokenInfo[]): TokenInfo[] => {
  const searchTermLowerCase = assetSearchTerm.toLowerCase()
  return searchTermLowerCase.length > 0 && tokenInfos.length > 0
    ? tokenInfos.filter((tokenInfo) => {
        const name = tokenInfo.ticker?.toLocaleLowerCase() ?? tokenInfo.name?.toLocaleLowerCase() ?? '-'
        if (name) return name.toLowerCase().includes(searchTermLowerCase)
        return false
      })
    : tokenInfos
}
