import {CardanoApi} from '@yoroi/api'
import {createTypeGuardFromSchema} from '@yoroi/common'
import {z} from 'zod'

import {BackendConfig} from '../../types'
import {asTokenId} from './utils'

export const fetchTokensSupplies = async (
  tokenIds: string[],
  config: BackendConfig,
): Promise<Record<string, string | null>> => {
  const normalizedTokenIds = tokenIds.map(asTokenId)
  return CardanoApi.getTokenSupply(config.API_ROOT)(normalizedTokenIds)
}

type AssetSupplyEntry = {
  supplies: {[key: string]: number | null}
}

const AssetSupplySchema: z.ZodSchema<AssetSupplyEntry> = z.object({
  supplies: z.record(z.number().nullable()),
})

export const isAssetSupplyEntry = createTypeGuardFromSchema(AssetSupplySchema)
