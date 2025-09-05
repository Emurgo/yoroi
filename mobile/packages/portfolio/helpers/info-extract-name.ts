import {truncateString} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'

// max name length is 50 and ticker is 9 in CIP26
// if the data is in metadatum there is "no limit"
export function infoExtractName(
  info: Portfolio.Token.Info,
  {
    mode = 'name',
    maxLength = mode === 'name' ? 25 : 9,
  }: {mode?: 'currency' | 'name'; maxLength?: number} = {},
) {
  if (mode === 'name') {
    if (info.type === Portfolio.Token.Type.FT) {
      return truncateString({
        value: info.ticker || info.name || info.fingerprint,
        maxLength,
      })
    } else {
      // NFTs without names usually are the "header" of collection
      return truncateString({value: info.name || info.fingerprint, maxLength})
    }
  }

  return truncateString({value: info.ticker, maxLength})
}
