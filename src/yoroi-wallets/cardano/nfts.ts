import {getAssetFingerprint} from '../../legacy/format'
import {AssetMetadata, NftMetadata, YoroiNft} from '../types'
import {asciiToHex} from './api/utils'

export const convertNfts = (assetMetadata: AssetMetadata, storageUrl: string): YoroiNft[] => {
  const policyId = Object.keys(assetMetadata)[0]
  const allMetadataKeys = Object.keys(assetMetadata[policyId])
  return allMetadataKeys.map((name) => {
    const metadata = assetMetadata[policyId][name]
    return convertNft(metadata, storageUrl, policyId, name)
  })
}

const convertNft = (metadata: NftMetadata, storageUrl: string, policyId: string, shortName: string): YoroiNft => {
  const assetNameHex = asciiToHex(shortName)
  const fingerprint = getAssetFingerprint(policyId, assetNameHex)
  const description = Array.isArray(metadata.description) ? metadata.description.join(' ') : metadata.description

  const id = `${policyId}.${assetNameHex}`
  return {
    id,
    fingerprint,
    name: metadata.name,
    description: description ?? '',
    thumbnail: `${storageUrl}/p_${fingerprint}.jpeg`,
    image: `${storageUrl}/${fingerprint}.jpeg`,
    metadata: {
      policyId,
      assetNameHex,
      originalMetadata: metadata,
    },
  }
}
