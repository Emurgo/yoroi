import {parseSafe} from '@yoroi/common'

import {WALLET_IMPLEMENTATION_REGISTRY} from '../yoroi-wallets/types/other'
import {AddressMode, WalletMeta} from './types'

export const parseWalletMeta = (data: unknown) => {
  const parsed = parseSafe(data)

  return isWalletMeta(parsed) ? parsed : undefined
}

const addressModes: ReadonlyArray<AddressMode> = ['single', 'multiple'] as const
export function isWalletMeta(walletMeta: unknown): walletMeta is WalletMeta {
  if (typeof walletMeta !== 'object' || walletMeta === null) return false
  return (
    // prettier-ignore
    !!walletMeta &&
      'id' in walletMeta
        && typeof walletMeta.id === 'string' &&
      'name' in walletMeta
        && typeof walletMeta.name === 'string' &&
      'networkId' in walletMeta
        && typeof walletMeta.networkId === 'number' &&
      'isHW' in walletMeta
        && typeof walletMeta.isHW === 'boolean' &&
      'isEasyConfirmationEnabled' in walletMeta
        && typeof walletMeta.isEasyConfirmationEnabled === 'boolean' &&
      'checksum' in walletMeta
        && typeof walletMeta.checksum === 'object' &&
      ('provider' in walletMeta
        && typeof walletMeta.provider === 'string'
        || !('provider' in walletMeta)) &&
      'walletImplementationId' in walletMeta
        && typeof walletMeta.walletImplementationId === 'string'
        && Object.values(WALLET_IMPLEMENTATION_REGISTRY).includes(walletMeta?.walletImplementationId as never) &&
      ('isShelley' in walletMeta
        && typeof walletMeta.isShelley === 'boolean'
        || !('isShelley' in walletMeta)) && 
      ('addressMode' in walletMeta 
        && typeof walletMeta.addressMode === 'string' 
        && addressModes.includes(walletMeta.addressMode as never))
  )
}

export const isAddressMode = (data: unknown): data is AddressMode => data === 'single' || data === 'multiple'

export const parseAddressMode = (data: unknown) => {
  const parsed = parseSafe(data)

  return isAddressMode(parsed) ? parsed : undefined
}
