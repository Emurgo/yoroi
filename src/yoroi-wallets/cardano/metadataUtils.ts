import {
  AuxiliaryData,
  BigNum,
  decodeMetadatumToJsonStr,
  encodeJsonStrToMetadatum,
  GeneralTransactionMetadata,
  MetadataJsonSchema,
  TransactionMetadatum,
} from '.'

export type JSONMetadata = {
  label: string
  data: Record<string, unknown>
}

export async function createAuxiliaryData(auxiliary: Array<JSONMetadata>) {
  const metadata = await GeneralTransactionMetadata.new()

  for (const meta of auxiliary) {
    const metadatum = await encodeJsonStrToMetadatum(JSON.stringify(meta.data), MetadataJsonSchema.BasicConversions)
    await metadata.insert(await BigNum.fromStr(meta.label), metadatum)
  }

  return await AuxiliaryData.new(metadata)
}

export async function parseMetadata(hex: string) {
  const metadatum = await TransactionMetadatum.fromBytes(Buffer.from(hex, 'hex'))
  const metadataString = decodeMetadatumToJsonStr(metadatum, MetadataJsonSchema.BasicConversions)

  return metadataString
}

export async function parseMetadataDetailed(hex: string) {
  const metadatum = await TransactionMetadatum.fromBytes(Buffer.from(hex, 'hex'))
  const metadataString = decodeMetadatumToJsonStr(metadatum, MetadataJsonSchema.DetailedSchema)

  return metadataString
}
