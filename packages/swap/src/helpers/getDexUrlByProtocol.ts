import {Swap} from '@yoroi/types'

import {getDexByProtocol} from './getDexByProtocol'
import {dexUrls} from '../constants'

export function getDexUrlByProtocol(protocol: Swap.Protocol) {
  return dexUrls[getDexByProtocol(protocol)] || 'https://yoroi-wallet.com'
}
