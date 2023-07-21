import {ampli} from '../metrics'
import {TokenInfo} from '../yoroi-wallets/types'

export const filterNfts = (searchTerm: string, nfts: TokenInfo[]): TokenInfo[] => {
  const searchTermLowerCase = searchTerm.toLowerCase()
  const filteredNfts =
    searchTermLowerCase.length > 0 ? nfts.filter((nft) => nft.name?.toLowerCase().includes(searchTermLowerCase)) : nfts
  return filteredNfts
}

let timeoutId: ReturnType<typeof setTimeout>
let lastSearch = ''
export const filterNftsMetrics = (searchTerm: string, resultCount: number) => {
  if (searchTerm === lastSearch) return
  lastSearch = searchTerm
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    ampli.nftGallerySearchActivated({nft_search_term: searchTerm, nft_count: resultCount})
  }, 500)
}
