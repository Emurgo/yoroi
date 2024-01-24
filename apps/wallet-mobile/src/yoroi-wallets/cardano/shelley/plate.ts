import {legacyWalletChecksum, walletChecksum} from '@emurgo/cip4-js'

import type {NetworkId} from '../../types/other'
import {PlateResponse} from '../../types/other'
import {CardanoMobile} from '../../wallets'
import {getMasterKeyFromMnemonic} from '../byron/util'
import {AddressGenerator} from '../chain'
import {WALLET_IMPLEMENTATION_ID} from '../constants/mainnet/constants'
import {AddressType} from '../formatPath'
import {NUMBERS} from '../numbers'

export const generateShelleyPlateFromKey = async (
  key: string,
  count: number,
  networkId: NetworkId,
  isJormungandr = false,
): Promise<PlateResponse> => {
  const addrType: AddressType = 'External'
  const addrGenerator = new AddressGenerator(key, addrType, WALLET_IMPLEMENTATION_ID, networkId)
  const accountPlate = isJormungandr ? legacyWalletChecksum(key) : walletChecksum(key)
  const addresses = await addrGenerator.generate([...Array(count).keys()])
  return {addresses, accountPlate}
}

export const generateShelleyPlateFromMnemonics = async (
  phrase: string,
  count: number,
  networkId: NetworkId,
  isJormungandr = false,
): Promise<PlateResponse> => {
  const rootKey = await getMasterKeyFromMnemonic(phrase)
  const rootKeyPtr = await CardanoMobile.Bip32PrivateKey.fromBytes(Buffer.from(rootKey, 'hex'))
  const accountKey = await (
    await (await rootKeyPtr.derive(NUMBERS.WALLET_TYPE_PURPOSE.CIP1852)).derive(NUMBERS.COIN_TYPES.CARDANO)
  ).derive(0 + NUMBERS.HARD_DERIVATION_START)
  const accountPubKey = await accountKey.toPublic()
  const accountPubKeyHex = Buffer.from(await accountPubKey.asBytes()).toString('hex')

  return generateShelleyPlateFromKey(accountPubKeyHex, count, networkId, isJormungandr)
}
