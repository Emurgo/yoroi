import {Balance} from '@yoroi/types'

export const filterNfts = (searchTerm: string, nfts: Balance.TokenInfo[]): Balance.TokenInfo[] => {
  const searchTermLowerCase = searchTerm.toLowerCase()
  const filteredNfts =
    searchTermLowerCase.length > 0 ? nfts.filter((nft) => nft.name?.toLowerCase().includes(searchTermLowerCase)) : nfts
  return filteredNfts
}
