import {legacyWalletChecksum, walletChecksum} from '@emurgo/cip4-js'
import {Bip32PrivateKey} from '@emurgo/react-native-haskell-shelley'

import {CONFIG} from '../../../../legacy/config/config'
import type {NetworkId} from '../../../../legacy/config/types'
import type {AddressType} from '../../../../legacy/crypto/commonUtils'
import type {PlateResponse} from '../../../../legacy/crypto/types'
import {AddressGenerator} from '../..'
import {getMasterKeyFromMnemonic} from '../byron/util'

export const generateShelleyPlateFromKey = async (
  key: string,
  count: number,
  networkId: NetworkId,
  isJormungandr? = false,
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
  isJormungandr? = false,
): Promise<PlateResponse> => {
  const masterKey = await getMasterKeyFromMnemonic(phrase)
  const masterKeyPtr = await Bip32PrivateKey.from_bytes(Buffer.from(masterKey, 'hex'))
  const accountKey = await (
    await (
      await masterKeyPtr.derive(CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852)
    ).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)
  ).derive(0 + CONFIG.NUMBERS.HARD_DERIVATION_START)
  const accountPubKey = await accountKey.to_public()
  const accountPubKeyHex = Buffer.from(await accountPubKey.as_bytes()).toString('hex')

  return await generateShelleyPlateFromKey(accountPubKeyHex, count, networkId, isJormungandr)
}
