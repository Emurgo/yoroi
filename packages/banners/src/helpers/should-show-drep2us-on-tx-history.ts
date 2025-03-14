import {time} from '@yoroi/common'

export const shouldShowDRep2UsOnTxHistory = ({
  isStaking,
  currentDRepIdHex,
  yoroiDRepIdHex,
  dismissedAt,
  ptBalance,
  ptMinBalance,
  isMainnet,
}: Readonly<{
  isStaking: boolean
  currentDRepIdHex: string
  yoroiDRepIdHex: string
  dismissedAt: number
  ptBalance: bigint
  ptMinBalance: bigint
  isMainnet: boolean
}>) => {
  const isYoroiDRep = currentDRepIdHex === yoroiDRepIdHex
  const hasBeenThirtyDays = dismissedAt + time.oneMonth < Date.now()
  const hasEnoughBalance = ptBalance >= ptMinBalance
  return (
    !isYoroiDRep &&
    hasBeenThirtyDays &&
    isStaking &&
    hasEnoughBalance &&
    isMainnet
  )
}
