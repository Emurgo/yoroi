import {Swap} from '@yoroi/types'

import {dexUrls} from '../constants'
import {getDexByProtocol} from './getDexByProtocol'

export function getDexUrlByProtocol(protocol: Swap.Protocol) {
  return dexUrls[getDexByProtocol(protocol)] || 'https://yoroi-wallet.com'
}
