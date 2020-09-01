// @flow

/**
 * Utility functions that can be required by different wallet
 * environments. Replaces the old util.js library now moved to Byron/util.js
 * TODO: migrate here common utilities from Byron/util.js
 */

import {Wallet} from 'react-native-cardano'
import {CONFIG} from '../config/config'
import {WALLET_IMPLEMENTATION_REGISTRY} from '../config/types'

import type {WalletImplementationId} from '../config/types'

export type AddressType = 'Internal' | 'External'

export const ADDRESS_TYPE_TO_CHANGE: {[AddressType]: number} = {
  External: 0,
  Internal: 1,
}

export const isValidAddress = async (
  address: string,
  isJormungandr: boolean,
): Promise<boolean> => {
  if (isJormungandr) {
    throw new Error('cannot validate jormungandr addresses')
  } else {
    try {
      return await Wallet.checkAddress(address)
    } catch (e) {
      return false
    }
  }
}

export const addressToDisplayString = async (
  address: string,
): Promise<string> => {
  // Need to try parsing as a legacy address first
  // Since parsing as bech32 directly may give a wrong result if the address contains a 1
  if (await isValidAddress(address, false)) {
    return address
  } else {
    throw new Error('cannot display jormungandr addresses')
  }
}

export const formatPath = (
  account: number,
  type: AddressType,
  index: number,
  walletImplementationId: WalletImplementationId,
) => {
  const HARD_DERIVATION_START = CONFIG.NUMBERS.HARD_DERIVATION_START
  let purpose
  switch (walletImplementationId) {
    case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY:
      purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
      break
    case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON:
      purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
      break
    case WALLET_IMPLEMENTATION_REGISTRY.JORMUNGANDR_ITN:
      purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
      break
    default:
      throw new Error('wallet implementation id not valid')
  }
  purpose = purpose - HARD_DERIVATION_START

  const COIN = CONFIG.NUMBERS.COIN_TYPES.CARDANO - HARD_DERIVATION_START

  return `m/${purpose}'/${COIN}'/${account}'/${
    ADDRESS_TYPE_TO_CHANGE[type]
  }/${index}`
}
