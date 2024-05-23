import {Balance} from '@yoroi/types'
import React from 'react'

import {useMetrics} from '../kernel/metrics/metricsManager'

export const filterNfts = (searchTerm: string, nfts: Balance.TokenInfo[]): Balance.TokenInfo[] => {
  const searchTermLowerCase = searchTerm.toLowerCase()
  const filteredNfts =
    searchTermLowerCase.length > 0 ? nfts.filter((nft) => nft.name?.toLowerCase().includes(searchTermLowerCase)) : nfts
  return filteredNfts
}

export const useTrackNftGallerySearchActivated = (searchTerm: string, resultCount: number) => {
  const {track} = useMetrics()

  React.useEffect(() => {
    if (!searchTerm) return

    const debounce = setTimeout(
      () => track.nftGallerySearchActivated({nft_search_term: searchTerm, nft_count: resultCount}),
      500,
    )

    return () => clearTimeout(debounce)
  }, [searchTerm, resultCount, track])
}
