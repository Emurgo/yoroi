import {features} from '../../features'
import {getAssetFingerprint} from '../../legacy/format'
import {NftMetadata, TokenInfo} from '../types'
import {isString} from '../utils'
import {asciiToHex} from './api'

export const convertNft = (options: {
  metadata?: NftMetadata
  storageUrl: string
  policyId: string
  shortName: string
}): TokenInfo<'nft'> => {
  const {metadata, storageUrl, policyId, shortName} = options
  const assetNameHex = asciiToHex(shortName)
  const fingerprint = getAssetFingerprint(policyId, assetNameHex)
  const description = normalizeProperty(metadata?.description)
  const originalImage = normalizeProperty(metadata?.image)
  const isIpfsImage = !!originalImage?.startsWith('ipfs://')
  const convertedImage = isIpfsImage ? originalImage?.replace('ipfs://', `https://ipfs.io/ipfs/`) : originalImage

  const id = `${policyId}.${assetNameHex}`
  const name = metadata?.name ?? shortName
  const image = features.moderatingNftsEnabled ? `${storageUrl}/${fingerprint}.jpeg` : convertedImage
  const thumbnail = features.moderatingNftsEnabled ? `${storageUrl}/p_${fingerprint}.jpeg` : convertedImage

  return {
    kind: 'nft',
    id,
    description,
    name,
    fingerprint,
    metadata: {
      policyId,
      originalMetadata: metadata,
      assetNameHex,
      image,
      thumbnail,
    },
  }
}

const normalizeProperty = (value: string | string[] | undefined): string | undefined => {
  if (isString(value)) return value
  if (Array.isArray(value)) return value.join('')
}
