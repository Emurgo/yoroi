import {
  FetchData,
  chunk,
  fetchData,
  getLogger,
  mergeRecords,
  valueIntoRecord,
} from '@yoroi/common'

import {freeze} from 'immer'

import {
  ChainPoolInfoMap,
  DEFAULT_SATURATION_THRESHOLD,
  ExplorerPoolInfo,
  ExplorerPoolInfoMap,
  FullChainPoolInfo,
  FullPoolInfo,
  FullPoolInfoMap,
  PoolTransition,
  TransitionData,
  WasmFactory,
  getMaybeNewEntriesByPool,
  normalisePoolIdentifierOrKey,
} from './pool-info-api'
import {
  getManyChainPoolInfoBatch,
  getManyExplorerPoolInfo,
  getPoolTransitionInfo,
  getSingleExplorerPoolInfo,
} from './pool-info-api-helpers'

export type PoolInfoApi = Readonly<{
  getSingleFullPoolInfo(hash: string): Promise<FullPoolInfo | null>
  getManyFullPoolInfo(hashes: string[]): Promise<FullPoolInfoMap>
  getSingleChainPoolInfo(hash: string): Promise<FullChainPoolInfo | null>
  getManyChainPoolInfo(hashes: string[]): Promise<ChainPoolInfoMap>
  getManyExplorerPoolInfo(hashes: string[]): Promise<ExplorerPoolInfoMap>
  getPool(hash: string): Promise<ExplorerPoolInfo | null>
  getSingleExplorerPoolInfo(hash: string): Promise<ExplorerPoolInfo | null>
  getPoolTransitionInfoPublic(): Promise<TransitionData | null>
  getTransition(
    hash: string,
    wasmFactory: WasmFactory,
  ): Promise<PoolTransition | null>
}>

export type PoolInfoApiMakerParams = {
  legacyApiBaseUrl: string
  request?: FetchData
  zeroApiUrl: string
}

export const poolInfoApiMaker = ({
  legacyApiBaseUrl,
  request = fetchData,
  zeroApiUrl,
}: PoolInfoApiMakerParams): PoolInfoApi => {
  const requestSize = 50

  // Helper functions that capture dependencies
  const getManyChainPoolInfoBatchFn = (hashes: string[]) =>
    getManyChainPoolInfoBatch({
      hashes,
      request,
      zeroApiUrl,
      requestSize,
    })

  const getSingleExplorerPoolInfoFn = (hash: string) =>
    getSingleExplorerPoolInfo({
      hash,
      request,
      zeroApiUrl,
    })

  const getManyExplorerPoolInfoFn = (hashes: string[]) =>
    getManyExplorerPoolInfo({
      hashes,
      getSingleExplorerPoolInfo: getSingleExplorerPoolInfoFn,
    })

  const getPoolTransitionInfoFn = () =>
    getPoolTransitionInfo({
      request,
      baseApiUrl: legacyApiBaseUrl,
    })

  const getPoolFn = (hash: string) => getSingleExplorerPoolInfoFn(hash)

  const getFirstUnsaturatedPoolFn = async (
    poolIds: Array<string>,
    threshold: number,
  ): Promise<ExplorerPoolInfo | null> => {
    let pool = null
    for (const suggestedId of poolIds) {
      pool = await getPoolFn(suggestedId)
      if (pool === null) continue
      const saturation = Number(pool.saturation)
      if (saturation <= threshold) return pool
    }
    // pick the last pool in case all pools are saturated (> 80%)
    return pool
  }

  const getManyChainPoolInfoFn = async (
    hashes: string[],
  ): Promise<ChainPoolInfoMap> => {
    const responses: Array<ChainPoolInfoMap> = await Promise.all(
      chunk(hashes, requestSize).map((batch) =>
        getManyChainPoolInfoBatchFn(batch),
      ),
    )
    return mergeRecords(responses) as ChainPoolInfoMap
  }

  const getSingleChainPoolInfoFn = async (
    hash: string,
  ): Promise<FullChainPoolInfo | null> => {
    const result = (await getManyChainPoolInfoFn([hash]))[hash]
    return result ?? null
  }

  const getSingleFullPoolInfoFn = async (
    hash: string,
  ): Promise<FullPoolInfo | null> => {
    const result = (await getManyFullPoolInfoFn([hash]))[hash]
    return result ?? null
  }

  const getManyFullPoolInfoFn = async (
    hashes: string[],
  ): Promise<FullPoolInfoMap> => {
    const [chainInfos, explorerInfos] = await Promise.all([
      getManyChainPoolInfoFn(hashes),
      getManyExplorerPoolInfoFn(hashes),
    ])
    return valueIntoRecord(hashes, (hash) => {
      const chain = chainInfos[hash]
      const explorer = explorerInfos[hash]
      return chain || explorer ? {chain, explorer} : null
    }) as FullPoolInfoMap
  }

  const getTransitionFn = async (
    hash: string,
    wasmFactory: WasmFactory,
  ): Promise<PoolTransition | null> => {
    const transitionData = await getPoolTransitionInfoFn()
    if (transitionData == null) return null

    const poolId = await normalisePoolIdentifierOrKey(hash, wasmFactory)
    const suggestion = getMaybeNewEntriesByPool(poolId.id, transitionData)
    if (suggestion == null) return null

    let saturationThreshold =
      transitionData.saturationThreshold ?? DEFAULT_SATURATION_THRESHOLD
    if (saturationThreshold < 0 || saturationThreshold > 1) {
      const logger = getLogger()
      getLogger().warn(
        `Incorrect saturation threshold value "${saturationThreshold}", expected between 0 and 1. Using default "${DEFAULT_SATURATION_THRESHOLD}"`,
        {origin: 'staking', operation: 'getTransition'},
      )
      saturationThreshold = DEFAULT_SATURATION_THRESHOLD
    }

    const [current, suggested] = await Promise.all([
      getPoolFn(hash),
      getFirstUnsaturatedPoolFn(suggestion.newEntries, saturationThreshold),
    ])

    if (!current || !suggested) return null

    return {
      current,
      suggested,
      deadlineMilliseconds: suggestion.deadline,
    }
  }

  return freeze({
    getSingleFullPoolInfo: getSingleFullPoolInfoFn,
    getManyFullPoolInfo: getManyFullPoolInfoFn,
    getSingleChainPoolInfo: getSingleChainPoolInfoFn,
    getManyChainPoolInfo: getManyChainPoolInfoFn,
    getManyExplorerPoolInfo: getManyExplorerPoolInfoFn,
    getPool: getPoolFn,
    getSingleExplorerPoolInfo: getSingleExplorerPoolInfoFn,
    getPoolTransitionInfoPublic: getPoolTransitionInfoFn,
    getTransition: getTransitionFn,
  })
}
