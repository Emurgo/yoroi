import {atomicBreakdown} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'

export function amountBreakdown({quantity, info}: Portfolio.Token.Amount) {
  return atomicBreakdown(quantity, info.decimals)
}
