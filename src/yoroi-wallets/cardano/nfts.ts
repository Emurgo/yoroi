import {features} from '../../features'
import {getAssetFingerprint} from '../../legacy/format'
import {NftMetadata, YoroiNft} from '../types'
import {isString} from '../utils'
import {asciiToHex} from './api/utils'

export const convertNft = (options: {
  metadata?: NftMetadata
  storageUrl: string
  policyId: string
  shortName: string
}): YoroiNft => {
  const {metadata, storageUrl, policyId, shortName} = options
  const assetNameHex = asciiToHex(shortName)
  const fingerprint = getAssetFingerprint(policyId, assetNameHex)
  const description = normalizeProperty(metadata?.description)
  const originalImage = normalizeProperty(metadata?.image)
  const isIpfsImage = !!originalImage?.startsWith('ipfs://')
  const convertedImage = isIpfsImage ? originalImage?.replace('ipfs://', `https://ipfs.io/ipfs/`) : originalImage

  const id = `${policyId}.${assetNameHex}`
  const name = metadata?.name ?? shortName

  return {
    id,
    fingerprint,
    name,
    description,
    thumbnail: features.moderatingNftsEnabled ? `${storageUrl}/p_${fingerprint}.jpeg` : convertedImage,
    logo: features.moderatingNftsEnabled ? `${storageUrl}/${fingerprint}.jpeg` : convertedImage,
    metadata: {
      policyId,
      assetNameHex,
      originalMetadata: metadata,
    },
  }
}

const normalizeProperty = (value: string | string[] | undefined): string | undefined => {
  if (value === undefined) return undefined
  if (isString(value)) return value
  return value.join(' ')
}
