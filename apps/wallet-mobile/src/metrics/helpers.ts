import {isFt, isNft} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'

const maxAmountsPerTrack = 30
export const assetsToSendProperties = ({amounts}: {amounts: Portfolio.Token.AmountRecords}) => {
  const limitedAssets = Object.entries(amounts).slice(0, maxAmountsPerTrack) as [
    Portfolio.Token.Id,
    Portfolio.Token.Amount,
  ][]
  return {
    asset_count: limitedAssets.length,
    nfts: limitedAssets
      .filter(([_, amount]) => isNft(amount.info))
      .map(([_, amount]) => ({name: amount.info.name, amount: amount.quantity.toString()})),
    tokens: limitedAssets
      .filter(([_, amount]) => isFt(amount.info))
      .map(([_, amount]) => ({
        name: amount.info.name,
        amount: amount.quantity.toString(),
      })),
  }
}
