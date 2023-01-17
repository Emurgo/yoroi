import {getAssetFingerprint} from '../../legacy/format'
import {AssetMetadata, NFTMetadata, YoroiNFT} from '../types'
import {asciiToHex} from '../utils/parsing'

export const convertNft = (assetMetadata: AssetMetadata, storageUrl: string): YoroiNFT => {
  const policyId = Object.keys(assetMetadata)[0]
  const assetNameKey = Object.keys(assetMetadata[policyId])[0]
  const metadata: NFTMetadata = assetMetadata[policyId][assetNameKey]
  const assetNameHex = asciiToHex(assetNameKey)
  const fingerprint = getAssetFingerprint(policyId, assetNameHex)
  const description = Array.isArray(metadata.description) ? metadata.description.join(' ') : metadata.description

  return {
    id: `${fingerprint}`,
    name: metadata.name,
    description: description ?? '',
    thumbnail: `${storageUrl}/p_${fingerprint}.jpeg`,
    image: `${storageUrl}/${fingerprint}.jpeg`,
    metadata: {
      policyId,
      assetNameHex: assetNameHex,
      originalMetadata: metadata,
    },
  }
}
