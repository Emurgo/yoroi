import {
  FetchData,
  getLogger,
  isRight,
  joinUrl,
  tuplesIntoRecord,
} from '@yoroi/common'

import {
  ChainPoolInfoMap,
  ExplorerPoolInfo,
  ExplorerPoolInfoMap,
  FullChainPoolInfo,
  TransitionData,
  TRANSITION_DATA_STUB,
} from './pool-info-api'
import {poolTransitionGetInfo} from './adapters/api/pool-transition-api'

type ExplorerPoolInfoApiRes = {
  data?: {
    data?: Array<{
      pool_id: string
      pool_id_hash_raw: string
      pool_name: {
        ticker: string
        name: string
      }
      pool_update: {
        active: {
          fixed_cost: number
          margin: number
        }
      }
      stats: {
        lifetime: {
          roa: number
        }
      }
      live_stake: number
      roa: string
      saturation: number
    }>
  }
}

export async function getManyChainPoolInfoBatch({
  hashes,
  request,
  zeroApiUrl,
  requestSize,
}: {
  hashes: string[]
  request: FetchData
  zeroApiUrl: string
  requestSize: number
}): Promise<ChainPoolInfoMap> {
  const poolInfoPromises = hashes.map(async (hash) => {
    try {
      const params = new URLSearchParams({
        limit: '1',
        order: 'ranking',
        poolId: hash,
      })
      const baseUrl = joinUrl(zeroApiUrl, '/cexplorer-pool-list')
      const zeroApiPoolsUrl = `${baseUrl}?${params.toString()}`
      const response = await request<ExplorerPoolInfoApiRes>({
        url: zeroApiPoolsUrl,
        method: 'get',
      })
      if (!isRight(response)) {
        throw new Error('Failed to fetch pool info')
      }
      const poolsData: ExplorerPoolInfoApiRes = response.value.data

      if (!poolsData.data?.data?.length) {
        return [hash, null] as [string, FullChainPoolInfo | null]
      }

      const [pool] = poolsData.data.data
      if (!pool) {
        return [hash, null] as [string, FullChainPoolInfo | null]
      }

      const chainInfo: FullChainPoolInfo = {
        info: {
          name: pool.pool_name.name || undefined,
          ticker: pool.pool_name.ticker || undefined,
          description: undefined,
          homepage: undefined,
        },
        history: [],
      }

      return [hash, chainInfo] as [string, FullChainPoolInfo | null]
    } catch (e) {
      const logger = getLogger()
      logger.error(e instanceof Error ? e : new Error(String(e)), {
        origin: 'staking',
        operation: 'getManyChainPoolInfoBatch',
        hash,
      })
      return [hash, null] as [string, FullChainPoolInfo | null]
    }
  })

  const results = await Promise.all(poolInfoPromises)
  return tuplesIntoRecord(results) as ChainPoolInfoMap
}

export async function getSingleExplorerPoolInfo({
  hash,
  request,
  zeroApiUrl,
}: {
  hash: string
  request: FetchData
  zeroApiUrl: string
}): Promise<ExplorerPoolInfo | null> {
  const params = new URLSearchParams({
    limit: '1',
    order: 'ranking',
    poolId: hash,
  })
  const baseUrl = joinUrl(zeroApiUrl, '/cexplorer-pool-list')
  const zeroApiPoolsUrl = `${baseUrl}?${params.toString()}`
  const response = await request<ExplorerPoolInfoApiRes>({
    url: zeroApiPoolsUrl,
    method: 'get',
  })
  if (!isRight(response)) {
    return null
  }
  const poolsData: ExplorerPoolInfoApiRes = response.value.data
  if (!poolsData.data?.data?.length) return null
  const [pool] = poolsData.data.data
  if (!pool) return null
  return {
    id: pool.pool_id,
    hash: pool.pool_id_hash_raw,
    ticker: pool.pool_name.ticker,
    name: pool.pool_name.name,
    pic: `https://ix.cexplorer.io/${pool.pool_id}`,
    stake: String(pool.live_stake),
    roa: String(pool.stats.lifetime.roa),
    taxFix: String(pool.pool_update.active.fixed_cost),
    taxRatio: String(pool.pool_update.active.margin),
    saturation: String(pool.saturation),
  }
}

export async function getManyExplorerPoolInfo({
  hashes,
  getSingleExplorerPoolInfo,
}: {
  hashes: string[]
  getSingleExplorerPoolInfo: (hash: string) => Promise<ExplorerPoolInfo | null>
}): Promise<ExplorerPoolInfoMap> {
  const hashInfoTuples = await Promise.all(
    hashes.map(
      async (hash) =>
        [hash, await getSingleExplorerPoolInfo(hash)] as [
          string,
          ExplorerPoolInfo | null,
        ],
    ),
  )
  return tuplesIntoRecord(hashInfoTuples) as ExplorerPoolInfoMap
}

export async function getPoolTransitionInfo({
  request,
  baseApiUrl,
}: {
  request: FetchData
  baseApiUrl: string
}): Promise<TransitionData | null> {
  try {
    const getPoolTransitionInfoFn = poolTransitionGetInfo({
      request,
      baseApiUrl,
    })
    const response = await getPoolTransitionInfoFn()
    if (isRight(response) && response.value.data) {
      return response.value.data
    }
  } catch (e) {
    const logger = getLogger()
    logger.error(e instanceof Error ? e : new Error(String(e)), {
      origin: 'staking',
      operation: 'getPoolTransitionInfo',
    })
  }
  return TRANSITION_DATA_STUB
}

