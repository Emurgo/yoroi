import {createTypeGuardFromSchema, isArrayOfType, isString} from '@yoroi/common'
import {domainNormalizer} from '@yoroi/resolver'
import {Balance} from '@yoroi/types'
import {z} from 'zod'

import {features} from '../../kernel/features'
import {getAssetFingerprint} from '../utils/format'
import {toDisplayAssetName} from './api/utils'
export const convertNft = (options: {
  metadata?: unknown
  storageUrl: string
  policyId: string
  nameHex: string
}): Balance.TokenInfo => {
  const {metadata, storageUrl, policyId, nameHex} = options
  const fingerprint = getAssetFingerprint(policyId, nameHex)
  const description = hasDescriptionProperty(metadata) ? normalizeProperty(metadata.description) : undefined
  const originalImage = hasImageProperty(metadata) ? normalizeProperty(metadata.image) : undefined
  const isIpfsImage = !!originalImage?.startsWith('ipfs://')
  const convertedImage = isIpfsImage ? originalImage?.replace('ipfs://', `https://ipfs.io/ipfs/`) : originalImage

  const id = `${policyId}.${nameHex}`
  const displayAssetName = domainNormalizer(policyId, toDisplayAssetName(id))

  const name = hasNameProperty(metadata) ? normalizeProperty(metadata.name) : displayAssetName
  const image = features.moderatingNftsEnabled ? `${storageUrl}/${fingerprint}.jpeg` : convertedImage
  const thumbnail = features.moderatingNftsEnabled ? `${storageUrl}/p_${fingerprint}.jpeg` : convertedImage
  const ticker = displayAssetName

  return {
    kind: 'nft',
    id,
    fingerprint,
    name,
    description,
    group: policyId,
    decimals: undefined,
    ticker,
    icon: thumbnail,
    image,
    symbol: undefined,
    metadatas: {mintNft: metadata},
  }
}

const normalizeProperty = (value: string | string[]): string => {
  if (isArrayOfType(value, isString)) return value.join('')
  return value
}

export const getNftMainImageMediaType = (nft: Balance.TokenInfo): string | undefined => {
  const originalMetadata = nft.metadatas.mintNft
  return hasMediaTypeProperty(originalMetadata) ? normalizeProperty(originalMetadata.mediaType) : undefined
}

export const getNftFilenameMediaType = (nft: Balance.TokenInfo, filename: string): string | undefined => {
  const originalMetadata = nft.metadatas.mintNft

  if (!hasFilesProperty(originalMetadata)) {
    return undefined
  }

  const files = originalMetadata.files ?? []
  const file = files.find((file) => file.src && normalizeProperty(file.src) === filename)
  return file?.mediaType
}

type NftMetadataFilesProperty = {
  files?: Array<{src?: string | string[]; mediaType?: string}>
}

const StringOrArrayOfStringsSchema: z.ZodSchema<string | string[]> = z.union([z.string(), z.array(z.string())])

const hasNameProperty = createTypeGuardFromSchema<{name: string | string[]}>(
  z.object({name: StringOrArrayOfStringsSchema}),
)

const hasDescriptionProperty = createTypeGuardFromSchema<{description: string | string[]}>(
  z.object({description: StringOrArrayOfStringsSchema}),
)

const hasMediaTypeProperty = createTypeGuardFromSchema<{mediaType: string | string[]}>(
  z.object({mediaType: StringOrArrayOfStringsSchema}),
)

const hasImageProperty = createTypeGuardFromSchema<{image: string | string[]}>(
  z.object({image: StringOrArrayOfStringsSchema}),
)

const NftMetadataFilesSchema: z.ZodSchema<NftMetadataFilesProperty> = z.object({
  files: z.array(z.object({src: StringOrArrayOfStringsSchema.optional(), mediaType: z.string().optional()})).optional(),
})

const hasFilesProperty = createTypeGuardFromSchema(NftMetadataFilesSchema)
