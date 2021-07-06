/* eslint-disable camelcase */
// @flow
import {
  TransactionMetadatum,
  encode_json_str_to_metadatum,
  decode_metadatum_to_json_str,
  MetadataJsonSchema,
  GeneralTransactionMetadata,
  BigNum,
  AuxiliaryData,
} from '@emurgo/react-native-haskell-shelley'

export type JSONMetadata = {|
  label: string,
  data: {},
|}

export async function createAuxiliaryData(
  auxiliary: Array<JSONMetadata>,
): AuxiliaryData {
  const metadata = await GeneralTransactionMetadata.new()

  for (const meta of auxiliary) {
    const metadatum = await encode_json_str_to_metadatum(
      JSON.stringify(meta.data),
      MetadataJsonSchema.BasicConversions,
    )
    await metadata.insert(
      await BigNum.from_str(meta.label),
      metadatum,
    )
  }

  return await AuxiliaryData.new(metadata)
}

export function parseMetadata(hex: string): any {
  const metadatum = TransactionMetadatum.from_bytes(Buffer.from(hex, 'hex'))
  const metadataString = decode_metadatum_to_json_str(
    metadatum,
    MetadataJsonSchema.BasicConversions,
  )
  return metadataString
}

export function parseMetadataDetailed(hex: string): any {
  const metadatum = TransactionMetadatum.from_bytes(Buffer.from(hex, 'hex'))
  const metadataString = decode_metadatum_to_json_str(
    metadatum,
    MetadataJsonSchema.DetailedSchema,
  )
  return metadataString
}
