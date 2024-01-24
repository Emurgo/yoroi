import {createTypeGuardFromSchema, isArrayOfType, isString} from '@yoroi/common'
import {Balance} from '@yoroi/types'
import {z} from 'zod'

import {features} from '../../features'
import {getAssetFingerprint} from '../../legacy/format'
import {utf8ToHex} from './api/utils'
export const convertNft = (options: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any
  storageUrl: string
  policyId: string
  shortName: string
}): Balance.TokenInfo => {
  const {metadata, storageUrl, policyId, shortName} = options
  const assetNameHex = utf8ToHex(shortName)
  const fingerprint = getAssetFingerprint(policyId, assetNameHex)
  const description = hasDescriptionProperty(metadata) ? normalizeProperty(metadata.description) : undefined
  const originalImage = hasImageProperty(metadata) ? normalizeProperty(metadata.image) : undefined
  const isIpfsImage = !!originalImage?.startsWith('ipfs://')
  const convertedImage = isIpfsImage ? originalImage?.replace('ipfs://', `https://ipfs.io/ipfs/`) : originalImage

  const id = `${policyId}.${assetNameHex}`
  const name = hasNameProperty(metadata) ? normalizeProperty(metadata.name) : shortName
  const image = features.moderatingNftsEnabled ? `${storageUrl}/${fingerprint}.jpeg` : convertedImage
  const thumbnail = features.moderatingNftsEnabled ? `${storageUrl}/p_${fingerprint}.jpeg` : convertedImage

  return {
    kind: 'nft',
    id,
    fingerprint,
    name,
    description,
    group: policyId,
    decimals: undefined,
    ticker: shortName,
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

export const isSvgMediaType = (mediaType: unknown): boolean => {
  return mediaType === 'image/svg+xml'
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

export const hasNameProperty = createTypeGuardFromSchema<{name: string | string[]}>(
  z.object({name: StringOrArrayOfStringsSchema}),
)

export const hasDescriptionProperty = createTypeGuardFromSchema<{description: string | string[]}>(
  z.object({description: StringOrArrayOfStringsSchema}),
)

export const hasMediaTypeProperty = createTypeGuardFromSchema<{mediaType: string | string[]}>(
  z.object({mediaType: StringOrArrayOfStringsSchema}),
)

export const hasImageProperty = createTypeGuardFromSchema<{image: string | string[]}>(
  z.object({image: StringOrArrayOfStringsSchema}),
)

const NftMetadataFilesSchema: z.ZodSchema<NftMetadataFilesProperty> = z.object({
  files: z.array(z.object({src: StringOrArrayOfStringsSchema.optional(), mediaType: z.string().optional()})).optional(),
})

export const hasFilesProperty = createTypeGuardFromSchema(NftMetadataFilesSchema)
