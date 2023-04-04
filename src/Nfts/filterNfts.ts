import {YoroiNft} from '../yoroi-wallets'

export const filterNfts = (searchTerm: string, nfts: YoroiNft[]): YoroiNft[] => {
  const searchTermLowerCase = searchTerm.toLowerCase()
  const filteredNfts =
    searchTermLowerCase.length > 0 ? nfts.filter((nft) => nft.name.toLowerCase().includes(searchTermLowerCase)) : nfts
  return filteredNfts
}
