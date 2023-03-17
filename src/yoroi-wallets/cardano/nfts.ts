import {features} from '../../features'
import {getAssetFingerprint} from '../../legacy/format'
import {NftMetadata, YoroiNft} from '../types'
import {isArray} from '../utils'
import {asciiToHex} from './api/utils'

export const convertNft = (
  metadata: NftMetadata,
  storageUrl: string,
  policyId: string,
  shortName: string,
): YoroiNft => {
  const assetNameHex = asciiToHex(shortName)
  const fingerprint = getAssetFingerprint(policyId, assetNameHex)
  const description = Array.isArray(metadata.description) ? metadata.description.join(' ') : metadata.description
  const originalImage = isArray(metadata.image) ? metadata.image.join('') : metadata.image
  const isIpfsImage = originalImage.startsWith('ipfs://')
  const convertedImage = isIpfsImage ? originalImage.replace('ipfs://', `https://ipfs.io/ipfs/`) : originalImage
  const id = `${policyId}.${assetNameHex}`
  return {
    id,
    fingerprint,
    name: metadata.name,
    description: description ?? '',
    thumbnail: features.moderatingNftsEnabled ? `${storageUrl}/p_${fingerprint}.jpeg` : convertedImage,
    image: features.moderatingNftsEnabled ? `${storageUrl}/${fingerprint}.jpeg` : convertedImage,
    metadata: {
      policyId,
      assetNameHex,
      originalMetadata: metadata,
    },
  }
}

export const createPlaceholderNft = ({shortName, policyId}: {shortName: string; policyId: string}): YoroiNft => {
  const assetNameHex = asciiToHex(shortName)
  const fingerprint = getAssetFingerprint(policyId, assetNameHex)
  const id = `${policyId}.${assetNameHex}`
  return {
    id,
    fingerprint,
    name: shortName,
    description: '',
    metadata: {
      policyId,
      assetNameHex,
    },
  }
}
