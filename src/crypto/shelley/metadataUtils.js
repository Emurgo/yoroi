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

export async function createMetadata(
  metadata: Array<JSONMetadata>
): TransactionMetadata {
  const transactionMetadata = await GeneralTransactionMetadata.new()

  for (const meta of metadata) {
    const metadatum = await encode_json_str_to_metadatum(
      JSON.stringify(meta.data),
      MetadataJsonSchema.BasicConversions
    )
    await transactionMetadata.insert(await BigNum.from_str(meta.label), metadatum)
  }

  return await TransactionMetadata.new(transactionMetadata)
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
