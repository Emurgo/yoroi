import {CardanoApi} from '@yoroi/api'
import {createTypeGuardFromSchema} from '@yoroi/common'
import {z} from 'zod'

import {BackendConfig} from '../../types'

export const fetchTokensSupplies = async (
  tokenIds: `${string}.${string}`[],
  config: BackendConfig,
): Promise<Record<string, string | null>> => {
  return CardanoApi.getTokenSupply(config.API_ROOT)(tokenIds)
}

type AssetSupplyEntry = {
  supplies: {[key: string]: number | null}
}

const AssetSupplySchema: z.ZodSchema<AssetSupplyEntry> = z.object({
  supplies: z.record(z.number().nullable()),
})

export const isAssetSupplyEntry = createTypeGuardFromSchema(AssetSupplySchema)
