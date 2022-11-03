import type {AddressType} from '../../../legacy/commonUtils'
import {generateWalletRootKey} from '../../../legacy/commonUtils'
import type {PlateResponse} from '../../types/other'
import {legacyWalletChecksum} from '..'
import {getAccountFromMasterKey, getAddresses} from './util'

export const generateByronPlateFromMnemonics = async (phrase: string, count: number): Promise<PlateResponse> => {
  const masterKeyPtr = await generateWalletRootKey(phrase)
  const masterKey = Buffer.from(await masterKeyPtr.asBytes()).toString('hex')
  const account = await getAccountFromMasterKey(masterKey)
  const displayAddrType: AddressType = 'External'

  const accountPlate = legacyWalletChecksum(account.root_cached_key)
  const addresses = await getAddresses(account, displayAddrType, [...Array(count).keys()])
  return {addresses, accountPlate}
}
