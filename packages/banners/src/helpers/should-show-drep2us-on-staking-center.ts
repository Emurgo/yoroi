import {time} from '@yoroi/common'

export const shouldShowDRep2UsOnStakingCenter = ({
  isStaking,
  currentDRepIdHex,
  yoroiDRepIdHex,
  dismissedAt,
  isMainnet,
}: Readonly<{
  isStaking: boolean
  currentDRepIdHex: string
  yoroiDRepIdHex: string
  dismissedAt: number
  isMainnet: boolean
}>) => {
  const isYoroiDRep = currentDRepIdHex === yoroiDRepIdHex
  const hasBeenThirtyDays = dismissedAt + time.oneMonth < Date.now()
  return !isYoroiDRep && hasBeenThirtyDays && isStaking && isMainnet
}
