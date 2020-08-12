// @flow

/**
 * Contains utility functions that can be used in both Byron and Jormungandr
 * environments. Replaces the old util.js library now moved to Byron/util.js
 * TODO: migrate here common utilities from Byron/util.js
 */

import {Wallet} from 'react-native-cardano'

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
