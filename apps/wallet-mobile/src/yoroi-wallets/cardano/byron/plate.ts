import type {PlateResponse} from '../../types/other'
import {AddressType} from '../formatPath'
import {generateWalletRootKey} from '../mnemonic'
import {legacyWalletChecksum} from '../types'
import {getAccountFromMasterKey, getAddresses} from './util'

export const generateByronPlateFromMnemonics = async (phrase: string, count: number): Promise<PlateResponse> => {
  const rootKeyPtr = await generateWalletRootKey(phrase)
  const rootKey = Buffer.from(await rootKeyPtr.asBytes()).toString('hex')
  const account = await getAccountFromMasterKey(rootKey)
  const displayAddrType: AddressType = 'External'

  const accountPlate = legacyWalletChecksum(account.root_cached_key)
  const addresses = await getAddresses(account, displayAddrType, [...Array(count).keys()])
  return {addresses, accountPlate}
}
