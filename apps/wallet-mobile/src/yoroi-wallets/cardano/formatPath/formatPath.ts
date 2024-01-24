/* eslint-disable @typescript-eslint/no-explicit-any */

import {DERIVATION_TYPES, WalletImplementationId} from '../../types'
import {NUMBERS} from '../numbers'
import {getWalletConfigById} from '../utils'

export type AddressType = 'Internal' | 'External'
export const ADDRESS_TYPE_TO_CHANGE: Record<AddressType, number> = {
  External: 0,
  Internal: 1,
}

export const formatPath = (
  account: number,
  type: AddressType,
  index: number,
  walletImplementationId: WalletImplementationId,
) => {
  const HARD_DERIVATION_START = NUMBERS.HARD_DERIVATION_START
  const walletConfig = getWalletConfigById(walletImplementationId)
  let purpose

  if (walletConfig.TYPE === DERIVATION_TYPES.BIP44) {
    purpose = NUMBERS.WALLET_TYPE_PURPOSE.BIP44
  } else if (walletConfig.TYPE === DERIVATION_TYPES.CIP1852) {
    purpose = NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
  } else {
    throw new Error('Unknown wallet purpose')
  }

  purpose = purpose - HARD_DERIVATION_START
  const COIN = NUMBERS.COIN_TYPES.CARDANO - HARD_DERIVATION_START
  return `m/${purpose}'/${COIN}'/${account}'/${ADDRESS_TYPE_TO_CHANGE[type]}/${index}`
}
