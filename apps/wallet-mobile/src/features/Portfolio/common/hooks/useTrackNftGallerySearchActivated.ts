import * as React from 'react'

import {useMetrics} from '../../../../kernel/metrics/metricsManager'

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
