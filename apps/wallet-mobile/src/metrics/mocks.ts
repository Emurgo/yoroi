/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {MetricsManager} from './metricsManager'

export const mockMetricsManager = (): MetricsManager => {
  const disable = () => Promise.resolve()
  const enable = () => Promise.resolve()
  const enabled = () => Promise.resolve(true)

  const init = () => Promise.resolve()
  const track = {
    nftGalleryDetailsTab: e,
    nftGalleryPageViewed: e,
    nftGallerySearchActivated: e,
    nftGalleryDetailsPageViewed: e,

    sendInitiated: e,
    sendAmountUpdated: e,
    sendAmountSelected: e,
    sendAmountPageViewed: e,
    sendConfirmedPageViewed: e,
    sendAmountPreviewSettled: e,
    sendAmountPreviewRequested: e,
    sendAmountPreviewSubmitted: e,
    sendAmountPreviewPageViewed: e,

    swapInitiated: e,
    swapPoolChanged: e,
    swapOrderSelected: e,
    swapAssetToChanged: e,
    swapOrderSubmitted: e,
    swapSlippageChanged: e,
    swapAssetFromChanged: e,
    swapConfirmedPageViewed: e,
    swapCancelationSubmitted: e,
  } as const

  return {
    init,
    track,
    enable,
    disable,
    enabled,
  } as const
}

const e = (event: any, options?: any): any => void 0
