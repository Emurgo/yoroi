import {TokenInfo} from '../../../yoroi-wallets'

export const filterAssets = (searchTerm: string, tokenInfos: TokenInfo[]): TokenInfo[] => {
  const searchTermLowerCase = searchTerm.toLowerCase()
  if (searchTermLowerCase.length === 0) return tokenInfos

  return tokenInfos.filter((tokenInfo) => {
    if (tokenInfo.kind === 'ft') {
      const name = tokenInfo.metadata.ticker?.toLocaleLowerCase() ?? tokenInfo.name?.toLocaleLowerCase() ?? null
      if (name) return name.toLowerCase().includes(searchTermLowerCase)
    }

    if (tokenInfo.kind === 'nft') {
      const name = tokenInfo.name?.toLocaleLowerCase() ?? null
      if (name) return name.toLowerCase().includes(searchTermLowerCase)
    }

    return false
  })
}
