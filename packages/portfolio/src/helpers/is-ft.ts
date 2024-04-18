import {Portfolio} from '@yoroi/types'

export const isFt = (tokenInfo: Portfolio.Token.Info): boolean =>
  tokenInfo.type === Portfolio.Token.Type.FT
