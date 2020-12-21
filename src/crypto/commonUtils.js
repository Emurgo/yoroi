// @flow

/**
 * Utility functions that can be required by different wallet
 * environments. Replaces the old util.js library now moved to Byron/util.js
 * TODO: migrate here common utilities from Byron/util.js
 */

import {Wallet} from 'react-native-cardano'
import {CONFIG, getWalletConfigById} from '../config/config'
import {DERIVATION_TYPES} from '../config/types'

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
  const walletConfig = getWalletConfigById(walletImplementationId)
  let purpose
  if (walletConfig.TYPE === DERIVATION_TYPES.BIP44) {
    purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
  } else if (walletConfig.TYPE === DERIVATION_TYPES.CIP1852) {
    purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
  } else {
    throw new Error('Unknown wallet purpose')
  }
  purpose = purpose - HARD_DERIVATION_START

  const COIN = CONFIG.NUMBERS.COIN_TYPES.CARDANO - HARD_DERIVATION_START

  return `m/${purpose}'/${COIN}'/${account}'/${ADDRESS_TYPE_TO_CHANGE[type]}/${index}`
}
