// properties must have quotes for bindings
/* eslint-disable quote-props */
/* eslint-disable camelcase */
// // @flow

import {
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

export const CatalystLabels = Object.freeze({
  DATA: 61284,
  SIG: 61285,
})
export async function generateRegistration(request: {|
  stakePrivateKey: Bip32PrivateKey,
  catalystPrivateKey: Bip32PrivateKey,
  receiverAddress: Buffer,
  absSlotNumber: number,
|}): TransactionMetadata {
  /**
   * Catalyst follows a certain standard to prove the voting power
   * A transaction is submitted with following metadata format for the registration process
   * label: 61284
   * {
   *   1: "pubkey generated for catalyst app",
   *   2: "stake key public key",
   *   3: "address to receive rewards to"
   * }
   * label: 61285
   * {
   *   1: "signature of blake2b-256 hash of the metadata signed using stakekey"
   * }
   */

  const registrationData = await encode_json_str_to_metadatum(
    JSON.stringify({
      '1': `0x${Buffer.from(
        await (await request.catalystPrivateKey.to_public()).as_bytes(),
      ).toString('hex')}`,
      '2': `0x${Buffer.from(
        await (await request.stakePrivateKey.to_public()).as_bytes(),
      ).toString('hex')}`,
      '3': `0x${Buffer.from(request.receiverAddress).toString('hex')}`,
      '4': request.absSlotNumber,
    }),
    MetadataJsonSchema.BasicConversions,
  )
  const generalMetadata = await GeneralTransactionMetadata.new()
  await generalMetadata.insert(
    await BigNum.from_str(CatalystLabels.DATA.toString()),
    registrationData,
  )

  const hashedMetadata = blake2b(256 / 8).update(
    await generalMetadata.to_bytes()
  ).digest('binary')

  const catalystSignature = await (await request.stakePrivateKey.sign(hashedMetadata)).to_hex()

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

export async function generatePrivateKeyForCatalyst(): Bip32PrivateKey {
  const mnemonic = generateAdaMnemonic()
  const bip39entropy = mnemonicToEntropy(mnemonic)
  const EMPTY_PASSWORD = Buffer.from('')
  const rootKey = await Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(bip39entropy, 'hex'),
    EMPTY_PASSWORD,
  )

  return rootKey
}
