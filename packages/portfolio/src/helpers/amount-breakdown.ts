import {splitBigInt} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'

export function amountBreakdown({quantity, info}: Portfolio.Token.Amount) {
  return splitBigInt(quantity, info.decimals)
}
