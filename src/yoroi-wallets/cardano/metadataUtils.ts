import {TxMetadata} from '@emurgo/yoroi-lib-core'

import {
  AuxiliaryData,
  BigNum,
  decodeMetadatumToJsonStr,
  encodeJsonStrToMetadatum,
  GeneralTransactionMetadata,
  MetadataJsonSchema,
  TransactionMetadatum,
} from '.'

export async function createAuxiliaryData(auxiliary: Array<TxMetadata>) {
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
