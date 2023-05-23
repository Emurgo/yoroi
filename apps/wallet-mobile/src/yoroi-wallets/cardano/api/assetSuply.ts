import {z} from 'zod'

import {BackendConfig} from '../../types'
import {createTypeGuardFromSchema} from '../../utils'
import fetchDefault from './fetch'
import {toAssetName, toPolicyId} from './utils'

export const fetchTokensSupplies = async (
  tokenIds: string[],
  config: BackendConfig,
): Promise<Record<string, number | null>> => {
  const assets = tokenIds.map((tokenId) => ({policy: toPolicyId(tokenId), name: toAssetName(tokenId) || ''}))
  const response = await fetchDefault<unknown>('multiAsset/supply', {assets}, config)

  if (!isAssetSupplyEntry(response)) {
    return {}
  }

  const supplies = assets.map((asset) => {
    const key = `${asset.policy}.${asset.name}`
    return response.supplies[key] || null
  })

  return Object.fromEntries(tokenIds.map((tokenId, index) => [tokenId, supplies[index]]))
}

type AssetSupplyEntry = {
  supplies: {[key: string]: number | null}
}

const AssetSupplySchema: z.ZodSchema<AssetSupplyEntry> = z.object({
  supplies: z.record(z.number().nullable()),
})

export const isAssetSupplyEntry = createTypeGuardFromSchema(AssetSupplySchema)
