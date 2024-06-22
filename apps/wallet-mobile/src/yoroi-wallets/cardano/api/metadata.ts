import {createTypeGuardFromSchema, isArray, isRecord} from '@yoroi/common'
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
    fetchDefault<Record<string, unknown>>('multiAsset/metadata', payload, config.API_ROOT),
    fetchDefault<{supplies: Record<string, unknown>}>(
      'multiAsset/supply?numberFormat=string',
      payload,
      config.API_ROOT,
    ),
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
  const nameHex = toAssetNameHex(tokenId)
  const displayAssetName = toDisplayAssetName(tokenId)

  const withHexName = `${policyId}.${nameHex}`
  const assetSupply = assetSupplies[withHexName]

  if (assetSupply !== '1') return null

  const metadataPolicyId = isRecord(nftAsset.metadata) ? nftAsset.metadata?.[policyId] : null
  const metadata = isRecord(metadataPolicyId) ? metadataPolicyId[nameHex] ?? metadataPolicyId[displayAssetName] : null

  return convertNft({metadata, storageUrl: config.NFT_STORAGE_URL, policyId, nameHex})
}

export const NFT_METADATA_KEY = '721'

const NftAssetSchema: z.ZodSchema<NFTAsset> = z.object({
  key: z.literal(NFT_METADATA_KEY),
  metadata: z.unknown().optional(),
})

const isAssetNft = createTypeGuardFromSchema(NftAssetSchema)
