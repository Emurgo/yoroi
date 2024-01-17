import {createTypeGuardFromSchema, isArray} from '@yoroi/common'
import {Balance} from '@yoroi/types'
import {z} from 'zod'

import {BackendConfig, NFTAsset} from '../../types'
import {convertNft} from '../nfts'
import fetchDefault from './fetch'
import {toAssetNameHex, toDisplayAssetName, toPolicyId} from './utils'

export const getNFT = async (tokenId: string, config: BackendConfig): Promise<Balance.TokenInfo | null> => {
  const policyId = toPolicyId(tokenId)
  const nameHex = toAssetNameHex(tokenId)

  const payload = {assets: [{policy: policyId, nameHex}]}

  const [assetMetadatasResult, {supplies: assetSupplies}] = await Promise.all([
    fetchDefault<Record<string, unknown>>('multiAsset/metadata', payload, config),
    fetchDefault<{supplies: Record<string, unknown>}>('multiAsset/supply?numberFormat=string', payload, config),
  ])

  const assetMetadatas = assetMetadatasResult[tokenId]

  return parseNFT(assetMetadatas, assetSupplies, tokenId, config)
}

export const parseNFT = (
  assetMetadatas: unknown,
  assetSupplies: Record<string, unknown>,
  tokenId: string,
  config: BackendConfig,
) => {
  if (!isArray(assetMetadatas)) {
    return null
  }

  const nftAsset = assetMetadatas.find(isAssetNft)

  if (!nftAsset) {
    return null
  }

  const policyId = toPolicyId(tokenId)
  const metadataPolicyId = nftAsset.metadata?.[policyId]

  const nameHex = toAssetNameHex(tokenId)
  const metadata = metadataPolicyId?.[nameHex] ?? metadataPolicyId?.[toDisplayAssetName(tokenId)]

  const nft = convertNft({metadata, storageUrl: config.NFT_STORAGE_URL, policyId, nameHex})

  return assetSupplies[nft.id] === '1' ? nft : null
}

export const NFT_METADATA_KEY = '721'

const NftAssetSchema: z.ZodSchema<NFTAsset> = z.object({
  key: z.literal(NFT_METADATA_KEY),
  metadata: z.unknown().optional(),
})

const isAssetNft = createTypeGuardFromSchema(NftAssetSchema)
