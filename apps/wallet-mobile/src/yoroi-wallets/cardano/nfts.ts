import {features} from '../../features'
import {getAssetFingerprint} from '../../legacy/format'
import {TokenInfo} from '../types'
import {hasProperties, isArray, isArrayOfType, isRecord, isString} from '../utils'
import {utf8ToHex} from './api/utils'

export const convertNft = (options: {
  metadata?: unknown
  storageUrl: string
  policyId: string
  shortName: string
}): TokenInfo<'nft'> => {
  const {metadata, storageUrl, policyId, shortName} = options
  const assetNameHex = utf8ToHex(shortName)
  const fingerprint = getAssetFingerprint(policyId, assetNameHex)
  const description = isRecord(metadata) ? normalizeProperty(metadata.description) : undefined
  const originalImage = isRecord(metadata) ? normalizeProperty(metadata.image) : undefined
  const isIpfsImage = !!originalImage?.startsWith('ipfs://')
  const convertedImage = isIpfsImage ? originalImage?.replace('ipfs://', `https://ipfs.io/ipfs/`) : originalImage

  const id = `${policyId}.${assetNameHex}`
  const name = isRecord(metadata) && isString(metadata.name) ? metadata.name : shortName
  const image = features.moderatingNftsEnabled ? `${storageUrl}/${fingerprint}.jpeg` : convertedImage
  const thumbnail = features.moderatingNftsEnabled ? `${storageUrl}/p_${fingerprint}.jpeg` : convertedImage

  return {
    kind: 'nft',
    id,
    fingerprint,
    name,
    description,
    metadata: {
      policyId,
      assetNameHex,
      originalMetadata: metadata,
      thumbnail,
      image,
    },
  }
}

const normalizeProperty = (value: unknown): string | undefined => {
  if (isString(value)) return value
  if (isArrayOfType(value, isString)) return value.join('')
}

export const isSvgMediaType = (mediaType: unknown): boolean => {
  return mediaType === 'image/svg+xml'
}

export const getNftFilenameMediaType = (nft: TokenInfo<'nft'>, filename: string): string | undefined => {
  const originalMetadata = isRecord(nft.metadata.originalMetadata) ? nft.metadata.originalMetadata : undefined
  const files = originalMetadata?.files ?? []
  if (!isArray(files)) return undefined

  const file = files.find((file) => {
    if (isRecord(file) && hasProperties(file, ['src'])) {
      return normalizeProperty(file.src) === filename
    }
    return false
  })
  return isRecord(file) && hasProperties(file, ['mediaType']) && isString(file.mediaType) ? file.mediaType : undefined
}
