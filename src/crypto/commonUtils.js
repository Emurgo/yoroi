// @flow

/**
 * Contains utility functions that can be used in both Byron and Shelley
 * environments. Replaces the old util.js library now moved to Byron/util.js
 * TODO: migrate here common utilities from Byron/util.js
 */

import {Wallet} from 'react-native-cardano'
import {Address} from 'react-native-chain-libs'
import {CONFIG} from '../config'

export type AddressType = 'Internal' | 'External'

export const ADDRESS_TYPE_TO_CHANGE: {[AddressType]: number} = {
  External: 0,
  Internal: 1,
}

export const isValidAddress = async (
  address: string,
  isShelley: boolean,
): Promise<boolean> => {
  if (isShelley) {
    try {
      await Address.from_string(address)
      return true
    } catch (e) {
      return false
    }
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
    try {
      const wasmAddr = await Address.from_bytes(Buffer.from(address, 'hex'))
      return await wasmAddr.to_string(CONFIG.BECH32_PREFIX.ADDRESS)
    } catch (e) {
      throw new Error(
        `addressToDisplayString: failed to parse address ${address}`,
      )
    }
  }
}
