import {legacyWalletChecksum, walletChecksum} from '@emurgo/cip4-js'

import {AddressType} from '../../../legacy/commonUtils'
import {CONFIG} from '../../../legacy/config'
import type {NetworkId} from '../../../legacy/types'
import {PlateResponse} from '../../../legacy/types'
import {AddressGenerator, Bip32PrivateKey} from '../..'
import {getMasterKeyFromMnemonic} from '../byron/util'

export const generateShelleyPlateFromKey = async (
  key: string,
  count: number,
  networkId: NetworkId,
  isJormungandr = false,
): Promise<PlateResponse> => {
  const addrType: AddressType = 'External'
  const addrGenerator = new AddressGenerator(
    key,
    addrType,
    CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
    networkId,
  )
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
  const masterKey = await getMasterKeyFromMnemonic(phrase)
  const masterKeyPtr = await Bip32PrivateKey.fromBytes(Buffer.from(masterKey, 'hex'))
  const accountKey = await (
    await (
      await masterKeyPtr.derive(CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852)
    ).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)
  ).derive(0 + CONFIG.NUMBERS.HARD_DERIVATION_START)
  const accountPubKey = await accountKey.toPublic()
  const accountPubKeyHex = Buffer.from(await accountPubKey.asBytes()).toString('hex')

  return await generateShelleyPlateFromKey(accountPubKeyHex, count, networkId, isJormungandr)
}
