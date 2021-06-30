// @flow
import {legacyWalletChecksum} from '@emurgo/cip4-js'

import {getAccountFromMasterKey, getAddresses} from './util'
import {generateWalletRootKey} from '../commonUtils'

import type {AddressType} from '../commonUtils'
import type {PlateResponse} from '../types'

export const generateByronPlateFromMnemonics = async (
  phrase: string,
  count: number,
): Promise<PlateResponse> => {
  const masterKeyPtr = await generateWalletRootKey(phrase)
  const masterKey = Buffer.from(await masterKeyPtr.as_bytes()).toString('hex')
  const account = await getAccountFromMasterKey(masterKey)
  const displayAddrType: AddressType = 'External'

  const accountPlate = legacyWalletChecksum(account.root_cached_key)
  const addresses = await getAddresses(account, displayAddrType, [
    ...Array(count).keys(),
  ])
  return {addresses, accountPlate}
}
