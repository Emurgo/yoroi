import {
  AuxiliaryData,
  BigNum,
  decode_metadatum_to_json_str,
  encode_json_str_to_metadatum,
  GeneralTransactionMetadata,
  MetadataJsonSchema,
  TransactionMetadatum,
} from '@emurgo/react-native-haskell-shelley'

export type JSONMetadata = {
  label: string
  data: Record<string, unknown>
}

export async function createAuxiliaryData(auxiliary: Array<JSONMetadata>) {
  const metadata = await GeneralTransactionMetadata.new()

  for (const meta of auxiliary) {
    const metadatum = await encode_json_str_to_metadatum(JSON.stringify(meta.data), MetadataJsonSchema.BasicConversions)
    await metadata.insert(await BigNum.from_str(meta.label), metadatum)
  }

  return await AuxiliaryData.new(metadata)
}

export async function parseMetadata(hex: string) {
  const metadatum = TransactionMetadatum.from_bytes(Buffer.from(hex, 'hex'))
  const metadataString = decode_metadatum_to_json_str(await metadatum, MetadataJsonSchema.BasicConversions)

  return metadataString
}

export async function parseMetadataDetailed(hex: string) {
  const metadatum = TransactionMetadatum.from_bytes(Buffer.from(hex, 'hex'))
  const metadataString = decode_metadatum_to_json_str(await metadatum, MetadataJsonSchema.DetailedSchema)

  return metadataString
}
