import {Portfolio} from '@yoroi/types'

export function isFt(tokenInfo: Portfolio.Token.Info) {
  return tokenInfo.type === Portfolio.Token.Type.FT
}
