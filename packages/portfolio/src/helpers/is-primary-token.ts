import {Portfolio} from '@yoroi/types'

export function isPrimaryToken(info: Portfolio.Token.Info) {
  return info.nature === Portfolio.Token.Nature.Primary
}
