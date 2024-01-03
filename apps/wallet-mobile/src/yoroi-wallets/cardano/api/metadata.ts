import {createTypeGuardFromSchema, isArray, isNonNullable, isRecord} from '@yoroi/common'
import {Balance} from '@yoroi/types'
import {z} from 'zod'

import {BackendConfig, NFTAsset} from '../../types'
import {convertNft} from '../nfts'
import {fetchTokensSupplies} from './assetSuply'
import fetchDefault from './fetch'
import {toAssetNameHex, toPolicyId} from './utils'

export const getNFTs = async (ids: string[], config: BackendConfig): Promise<Balance.TokenInfo[]> => {
  if (ids.length === 0) {
    return []
  }
  const assets = ids.map((id) => {
    const policy = toPolicyId(id)
    const nameHex = toAssetNameHex(id)
    return {policy, nameHex}
  })

  const payload = {assets}

  const [assetMetadatas, assetSupplies] = await Promise.all([
    fetchDefault<unknown>('multiAsset/metadata', payload, config),
    fetchTokensSupplies(ids, config),
  ])

  const possibleNfts = parseNFTs(assetMetadatas, config.NFT_STORAGE_URL)
  return possibleNfts.filter((nft) => assetSupplies[nft.id] === '1')
}

export const getNFT = async (id: string, config: BackendConfig): Promise<Balance.TokenInfo | null> => {
  const [nft] = await getNFTs([id], config)
  return nft || null
}

export const parseNFTs = (value: unknown, storageUrl: string): Balance.TokenInfo[] => {
  if (!isRecord(value)) {
    throw new Error('Invalid response. Expected to receive object when parsing NFTs')
  }

  const identifiers = Object.keys(value)

  const tokens: Array<Balance.TokenInfo | null> = identifiers.map((id) => {
    const assets = value[id]
    if (!isArray(assets)) {
      return null
    }

    const nftAsset = assets.find(isAssetNft)

    if (!nftAsset) {
      return null
    }

    const [policyId, shortName] = id.split('.')
    const metadata = nftAsset.metadata?.[policyId]?.[shortName]
    return convertNft({metadata, storageUrl, policyId, shortName: shortName})
  })

  return tokens.filter(isNonNullable)
}

const NFT_METADATA_KEY = '721'

const NftAssetSchema: z.ZodSchema<NFTAsset> = z.object({
  key: z.literal(NFT_METADATA_KEY),
  metadata: z.unknown().optional(),
})

const isAssetNft = createTypeGuardFromSchema(NftAssetSchema)
