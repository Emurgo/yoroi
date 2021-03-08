/* eslint-disable camelcase */
// // @flow
import {
  TransactionMetadatum,
  encode_json_str_to_metadatum,
  decode_metadatum_to_json_str,
  MetadataJsonSchema,
  GeneralTransactionMetadata,
  BigNum,
  TransactionMetadata,
} from '@emurgo/react-native-haskell-shelley'

export type JSONMetadata = {|
  label: string,
  data: {...},
|}

export function createMetadata(
  metadata: Array<JSONMetadata>
): TransactionMetadata {
  const transactionMetadata = GeneralTransactionMetadata.new()

  metadata.forEach((meta: JSONMetadata) => {
    const metadatum = encode_json_str_to_metadatum(
      JSON.stringify(meta.data),
      MetadataJsonSchema.BasicConversions
    )
    transactionMetadata.insert(BigNum.from_str(meta.label), metadatum)
  })

  return TransactionMetadata.new(transactionMetadata)
}

export function parseMetadata(hex: string): any {
  const metadatum = TransactionMetadatum.from_bytes(Buffer.from(hex, 'hex'))
  const metadataString = decode_metadatum_to_json_str(
    metadatum, MetadataJsonSchema.BasicConversions
  )
  return metadataString
}

export function parseMetadataDetailed(hex: string): any {
  const metadatum = TransactionMetadatum.from_bytes(Buffer.from(hex, 'hex'))
  const metadataString = decode_metadatum_to_json_str(
    metadatum, MetadataJsonSchema.DetailedSchema
  )
  return metadataString
}
