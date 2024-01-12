import {createTypeGuardFromSchema, isArray} from '@yoroi/common'
import {Balance} from '@yoroi/types'
import {z} from 'zod'

import {BackendConfig, NFTAsset} from '../../types'
import {convertNft} from '../nfts'
import {fetchTokensSupplies} from './assetSuply'
import fetchDefault from './fetch'
import {toAssetNameHex, toPolicyId} from './utils'

export const getNFT = async (id: string, config: BackendConfig): Promise<Balance.TokenInfo | null> => {
  const policyId = toPolicyId(id)
  const nameHex = toAssetNameHex(id)

  const payload = {assets: [{policy: policyId, nameHex}]}

  const [assetMetadatasResult, assetSupplies] = await Promise.all([
    fetchDefault<Record<string, unknown>>('multiAsset/metadata', payload, config),
    fetchTokensSupplies([id], config),
  ])

  const assetMetadatas = assetMetadatasResult[id]

  return parseNFT(assetMetadatas, assetSupplies, policyId, nameHex, config)
}

export const parseNFT = (
  assetMetadatas: unknown,
  assetSupplies: Record<string, unknown>,
  policyId: string,
  nameHex: string,
  config: BackendConfig,
) => {
  if (!isArray(assetMetadatas)) {
    return null
  }

  const nftAsset = assetMetadatas.find(isAssetNft)

  if (!nftAsset) {
    return null
  }

  const metadata = nftAsset.metadata?.[policyId]?.[nameHex]
  const nft = convertNft({metadata, storageUrl: config.NFT_STORAGE_URL, policyId, nameHex})

  return assetSupplies[nft.id] === '1' || assetSupplies[nft.id] === '0' ? nft : null
}

export const NFT_METADATA_KEY = '721'

const NftAssetSchema: z.ZodSchema<NFTAsset> = z.object({
  key: z.literal(NFT_METADATA_KEY),
  metadata: z.unknown().optional(),
})

const isAssetNft = createTypeGuardFromSchema(NftAssetSchema)
