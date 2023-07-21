import React from 'react'

import {ampli} from '../metrics'
import {TokenInfo} from '../yoroi-wallets/types'

export const filterNfts = (searchTerm: string, nfts: TokenInfo[]): TokenInfo[] => {
  const searchTermLowerCase = searchTerm.toLowerCase()
  const filteredNfts =
    searchTermLowerCase.length > 0 ? nfts.filter((nft) => nft.name?.toLowerCase().includes(searchTermLowerCase)) : nfts
  return filteredNfts
}

export const useTrackNftGallerySearchActivated = (searchTerm: string, resultCount: number) => {
  React.useEffect(() => {
    if (!searchTerm) return

    const timeoutId = setTimeout(
      () => ampli.nftGallerySearchActivated({nft_search_term: searchTerm, nft_count: resultCount}),
      500,
    )

    return () => clearTimeout(timeoutId)
  }, [searchTerm, resultCount])
}
