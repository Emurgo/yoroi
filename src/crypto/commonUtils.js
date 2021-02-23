// @flow

/**
 * Utility functions that can be required by different wallet
 * environments. Replaces the old util.js library now moved to Byron/util.js
 * TODO: migrate here common utilities from Byron/util.js
 */

import {BigNumber} from 'bignumber.js'

import {Wallet} from 'react-native-cardano'
import {CONFIG, getWalletConfigById} from '../config/config'
import {DERIVATION_TYPES} from '../config/types'
import {MultiToken, type DefaultTokenEntry} from './MultiToken'

import type {WalletImplementationId} from '../config/types'
import type {SendTokenList} from './types'

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

  return `m/${purpose}'/${COIN}'/${account}'/${
    ADDRESS_TYPE_TO_CHANGE[type]
  }/${index}`
}

export const hasSendAllDefault = (tokens: SendTokenList): boolean => {
  const defaultSendAll = tokens.find((token) => {
    if (token.shouldSendAll === true && token.token.isDefault) return true
    return false
  })
  return defaultSendAll != null
}

/**
 * Construct the list of what will be included in the tx output
 */
export const builtSendTokenList = (
  defaultToken: DefaultTokenEntry,
  tokens: SendTokenList,
  utxos: Array<MultiToken>,
): MultiToken => {
  const amount = new MultiToken([], defaultToken)

  for (const token of tokens) {
    if (token.amount != null) {
      // if we add a specific amount of a specific token to the output, just add it
      amount.add({
        amount: new BigNumber(token.amount),
        identifier: token.token.identifier,
        networkId: token.token.networkId,
      })
    } else if (token.token.isDefault) {
      // if we add a non-specific amount of the default token
      // sum amount values in the UTXO
      const relatedUtxoSum = utxos.reduce(
        (value, next) => value.plus(next.getDefaultEntry().amount),
        new BigNumber(0),
      )
      amount.add({
        amount: relatedUtxoSum,
        identifier: token.token.identifier,
        networkId: token.token.networkId,
      })
    } else {
      // if we add a non-specific amount of a given token
      // sum up the value of all our UTXOs with this token
      const relatedUtxoSum = utxos.reduce((value, next) => {
        const assetEntry = next
          .nonDefaultEntries()
          .find((entry) => entry.identifier === token.token.identifier)
        if (assetEntry != null) {
          return value.plus(assetEntry.amount)
        }
        return value
      }, new BigNumber(0))
      amount.add({
        amount: relatedUtxoSum,
        identifier: token.token.identifier,
        networkId: token.token.networkId,
      })
    }
  }
  return amount
}
