import {Portfolio} from '@yoroi/types'

export function isPrimary(info: Portfolio.Token.Info) {
  return info.nature === Portfolio.Token.Nature.Primary
}
