// @flow

/**
 * utility cryptographic functions for Shelley
 */

import {mnemonicToEntropy} from 'bip39'
import {
  Address,
  AddressDiscrimination,
  Bip32PrivateKey,
} from 'react-native-chain-libs'

import {CONFIG, NUMBERS} from '../../config'

export const generateWalletRootKey = async (
  mnemonic: string,
): Promise<Bip32PrivateKey> => {
  const bip39entropy = mnemonicToEntropy(mnemonic)
  /**
   * there is no wallet entropy password in yoroi
   * the PASSWORD here is the password to add more _randomness_
   * when deriving the wallet root key from the entropy
   * it is NOT the spending PASSWORD
   */
  const EMPTY_PASSWORD = Buffer.from('')
  const rootKey = await Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(bip39entropy, 'hex'),
    EMPTY_PASSWORD,
  )
  return rootKey
}

export const getFirstInternalAddr = async (
  recoveryPhrase: string,
): Promise<{bech32: string, hex: string}> => {
  const accountKey = await (await (await (await generateWalletRootKey(
    recoveryPhrase,
  )).derive(NUMBERS.WALLET_TYPE_PURPOSE.CIP1852)).derive(
    NUMBERS.COIN_TYPES.CARDANO,
  )).derive(0 + NUMBERS.HARD_DERIVATION_START)

  const internalKey = await (await (await (await accountKey.derive(
    NUMBERS.CHAIN_DERIVATIONS.INTERNAL,
  )).derive(0)).to_public()).to_raw_key()

  const stakingKey = await (await (await (await accountKey.derive(
    NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
  )).derive(NUMBERS.STAKING_KEY_INDEX)).to_public()).to_raw_key()

  const internalAddr = await Address.delegation_from_public_key(
    internalKey,
    stakingKey,
    CONFIG.NETWORK === 'Mainnet'
      ? await AddressDiscrimination.Production
      : await AddressDiscrimination.Test,
  )
  const internalAddrHash = Buffer.from(await internalAddr.as_bytes()).toString(
    'hex',
  )
  return {
    hex: internalAddrHash,
    bech32: await internalAddr.to_string(CONFIG.BECH32_PREFIX.ADDRESS),
  }
}
