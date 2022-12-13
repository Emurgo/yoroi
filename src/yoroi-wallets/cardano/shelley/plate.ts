import {AddressType} from '../../../legacy/commonUtils'
import {CONFIG} from '../../../legacy/config'
import {AddressGenerator, CardanoMobile, legacyWalletChecksum, walletChecksum} from '../..'
import type {NetworkId} from '../../types/other'
import {PlateResponse} from '../../types/other'
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
  const rootKey = await getMasterKeyFromMnemonic(phrase)
  const rootKeyPtr = await CardanoMobile.Bip32PrivateKey.fromBytes(Buffer.from(rootKey, 'hex'))
  const accountKey = await (
    await (
      await rootKeyPtr.derive(CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852)
    ).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)
  ).derive(0 + CONFIG.NUMBERS.HARD_DERIVATION_START)
  const accountPubKey = await accountKey.toPublic()
  const accountPubKeyHex = Buffer.from(await accountPubKey.asBytes()).toString('hex')

  return generateShelleyPlateFromKey(accountPubKeyHex, count, networkId, isJormungandr)
}
