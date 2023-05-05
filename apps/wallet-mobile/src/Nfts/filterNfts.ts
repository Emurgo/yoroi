import {TokenInfo} from '../yoroi-wallets/types'

export const filterNfts = (searchTerm: string, nfts: TokenInfo<'nft'>[]): TokenInfo<'nft'>[] => {
  const searchTermLowerCase = searchTerm.toLowerCase()
  const filteredNfts =
    searchTermLowerCase.length > 0 ? nfts.filter((nft) => nft.name?.toLowerCase().includes(searchTermLowerCase)) : nfts
  return filteredNfts
}
