import {time} from '../../../kernel/constants'

export const shouldShowDRepConsiderDelegating = ({
  isStaking,
  currentDRepIdHex,
  yoroiDRepIdHex,
  dismissedAt,
}: Readonly<{
  isStaking: boolean
  currentDRepIdHex: string
  yoroiDRepIdHex: string
  dismissedAt: number
}>) => {
  const isYoroiDRep = currentDRepIdHex === yoroiDRepIdHex
  const hasBeenThirtyDays = dismissedAt + time.oneMonth < Date.now()
  return !isYoroiDRep && hasBeenThirtyDays && isStaking
}
