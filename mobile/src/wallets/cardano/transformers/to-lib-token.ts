import {isPrimaryToken} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'

export function toLibToken(tokenInfo: Portfolio.Token.Info) {
  return {
    identifier: tokenInfo.id,
    isDefault: isPrimaryToken(tokenInfo),
  }
}
