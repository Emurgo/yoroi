import {parseSafe} from '@yoroi/common'
import {Wallet} from '@yoroi/types'

import {addressModes, implementations} from '../constants'

export function isWalletMeta(walletMeta: unknown): walletMeta is Wallet.Meta {
  if (walletMeta == null) return false
  if (typeof walletMeta !== 'object') return false
  return (
    !!walletMeta &&
    'version' in walletMeta &&
    typeof walletMeta.version === 'number' &&
    'plate' in walletMeta &&
    typeof walletMeta.plate === 'string' &&
    'avatar' in walletMeta &&
    typeof walletMeta.avatar === 'string' &&
    'id' in walletMeta &&
    typeof walletMeta.id === 'string' &&
    'name' in walletMeta &&
    typeof walletMeta.name === 'string' &&
    'isHW' in walletMeta &&
    typeof walletMeta.isHW === 'boolean' &&
    'isReadOnly' in walletMeta &&
    typeof walletMeta.isReadOnly === 'boolean' &&
    'isEasyConfirmationEnabled' in walletMeta &&
    typeof walletMeta.isEasyConfirmationEnabled === 'boolean' &&
    'implementation' in walletMeta &&
    typeof walletMeta.implementation === 'string' &&
    implementations.includes(walletMeta.implementation as never) &&
    'addressMode' in walletMeta &&
    typeof walletMeta.addressMode === 'string' &&
    addressModes.includes(walletMeta.addressMode as never)
  )
}

export const parseWalletMeta = (data: unknown) => {
  const parsed = parseSafe(data)

  return isWalletMeta(parsed) ? parsed : undefined
}
