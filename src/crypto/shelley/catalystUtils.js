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
} from '@emurgo/react-native-haskell-shelley'
import {generateMnemonic, mnemonicToEntropy} from 'bip39'

export const CatalystLabels = Object.freeze({
  DATA: 61284,
  SIG: 61285,
})
export function generateRegistration(request: {|
  stakePrivateKey: Bip32PrivateKey,
  catalystPrivateKey: Bip32PrivateKey,
  receiverAddress: Buffer,
|}): GeneralTransactionMetadata {
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
   *   1: "signature of metadata signed using stakekey"
   * }
   */

  const registrationData = encode_json_str_to_metadatum(
    JSON.stringify({
      '1': `0x${Buffer.from(
        request.catalystPrivateKey.to_public().as_bytes(),
      ).toString('hex')}`,
      '2': `0x${Buffer.from(
        request.stakePrivateKey.to_public().as_bytes(),
      ).toString('hex')}`,
      '3': `0x${Buffer.from(request.receiverAddress).toString('hex')}`,
    }),
    MetadataJsonSchema.BasicConversions,
  )
  const generalMetadata = GeneralTransactionMetadata.new()
  generalMetadata.insert(
    BigNum.from_str(CatalystLabels.DATA.toString()),
    registrationData,
  )

  const catalystSignature = request.stakePrivateKey
    .sign(generalMetadata.to_bytes())
    .to_hex()

  generalMetadata.insert(
    BigNum.from_str(CatalystLabels.SIG.toString()),
    encode_json_str_to_metadatum(
      JSON.stringify({
        '1': `0x${catalystSignature}`,
      }),
      MetadataJsonSchema.BasicConversions,
    ),
  )

  return generalMetadata
}

export function generatePrivateKeyForCatalyst(): Bip32PrivateKey {
  const mnemonic = generateMnemonic(160)
  const bip39entropy = mnemonicToEntropy(mnemonic)
  const EMPTY_PASSWORD = Buffer.from('')
  const rootKey = Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(bip39entropy, 'hex'),
    EMPTY_PASSWORD,
  )

  return rootKey
}
