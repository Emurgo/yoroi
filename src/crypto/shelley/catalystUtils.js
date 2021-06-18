// properties must have quotes for bindings
/* eslint-disable quote-props */
/* eslint-disable camelcase */
// // @flow

import {
  Address,
  PrivateKey,
  Bip32PrivateKey,
  encode_json_str_to_metadatum,
  MetadataJsonSchema,
  GeneralTransactionMetadata,
  BigNum,
  TransactionMetadata,
} from '@emurgo/react-native-haskell-shelley'
import {mnemonicToEntropy} from 'bip39'
import blake2b from 'blake2b'

import {generateAdaMnemonic} from '../byron/util'
import {CONFIG} from '../../config/config'
import {Logger} from '../../utils/logging'

export const CatalystLabels = Object.freeze({
  DATA: 61284,
  SIG: 61285,
})
export async function generateRegistration(request: {|
  stakePrivateKey: PrivateKey,
  catalystPrivateKey: PrivateKey,
  rewardAddress: Address,
  absSlotNumber: number,
|}): Promise<TransactionMetadata> {
  /**
   * Catalyst follows a certain standard to prove the voting power
   * A transaction is submitted with following metadata format for the registration process
   * label: 61284
   * {
   *   1: "pubkey generated for catalyst app",
   *   2: "stake key public key",
   *   3: "reward address to receive voting rewards"
   *   4: nonce
   * }
   * label: 61285
   * {
   *   1: "signature of blake2b-256 hash of the metadata signed using stakekey"
   * }
   */

  let nonce
  if (CONFIG.DEBUG.PREFILL_FORMS) {
    if (!__DEV__) throw new Error('using debug data in non-dev env')
    nonce = CONFIG.DEBUG.CATALYST_NONCE
  } else {
    nonce = request.absSlotNumber
  }

  const jsonMeta = JSON.stringify({
    '1': `0x${Buffer.from(
      await (await request.catalystPrivateKey.to_public()).as_bytes(),
    ).toString('hex')}`,
    '2': `0x${Buffer.from(
      await (await request.stakePrivateKey.to_public()).as_bytes(),
    ).toString('hex')}`,
    '3': `0x${Buffer.from(await request.rewardAddress.to_bytes()).toString(
      'hex',
    )}`,
    '4': nonce,
  })
  const registrationData = await encode_json_str_to_metadatum(
    jsonMeta,
    MetadataJsonSchema.BasicConversions,
  )
  Logger.debug(jsonMeta)
  const generalMetadata = await GeneralTransactionMetadata.new()
  await generalMetadata.insert(
    await BigNum.from_str(CatalystLabels.DATA.toString()),
    registrationData,
  )

  const hashedMetadata = blake2b(256 / 8)
    .update(await generalMetadata.to_bytes())
    .digest('binary')

  const catalystSignature = await (
    await request.stakePrivateKey.sign(hashedMetadata)
  ).to_hex()

  await generalMetadata.insert(
    await BigNum.from_str(CatalystLabels.SIG.toString()),
    await encode_json_str_to_metadatum(
      JSON.stringify({
        '1': `0x${catalystSignature}`,
      }),
      MetadataJsonSchema.BasicConversions,
    ),
  )
  const trxMetadata = await TransactionMetadata.new(generalMetadata)
  return trxMetadata
}

// prettier-ignore
export async function generatePrivateKeyForCatalyst(): Promise<Bip32PrivateKey> {
  let mnemonic
  if (CONFIG.DEBUG.PREFILL_FORMS) {
    if (!__DEV__) throw new Error('using debug data in non-dev env')
    mnemonic = CONFIG.DEBUG.MNEMONIC3
  } else {
    mnemonic = generateAdaMnemonic()
  }
  const bip39entropy = mnemonicToEntropy(mnemonic)
  const EMPTY_PASSWORD = Buffer.from('')
  const rootKey = await Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(bip39entropy, 'hex'),
    EMPTY_PASSWORD,
  )

  return rootKey
}

export const isRegistrationOpen = (
  fundInfo: ?{|
    +registrationStart: string,
    +registrationEnd: string,
  |},
) => {
  const now = new Date()

  if (fundInfo != null) {
    const startDate = new Date(Date.parse(fundInfo.registrationStart))
    const endDate = new Date(Date.parse(fundInfo.registrationEnd))
    if (now >= startDate && now <= endDate) {
      return true
    }
    return false
  } else {
    // if we don't get fund info from server, fallback to hardcoded dates
    const rounds = CONFIG.CATALYST.VOTING_ROUNDS
    for (const round of rounds) {
      const startDate = new Date(Date.parse(round.START_DATE))
      const endDate = new Date(Date.parse(round.END_DATE))
      if (now >= startDate && now <= endDate) {
        return true
      }
    }
    return false
  }
}
