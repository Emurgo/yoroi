import {Balance} from '@yoroi/types'

export function tokenKeyExtractor(token: Balance.Token) {
  return token.info.id
}
