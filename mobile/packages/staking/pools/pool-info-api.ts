// PoolInfoApi migrated from @emurgo/yoroi-lib
// This file contains the PoolInfoApi class for fetching stake pool information
import {
  chunk,
  getLogger,
  isHex,
  joinUrl,
  mergeRecords,
  tuplesIntoRecord,
  valueIntoRecord,
} from '@yoroi/common'

import type {Ed25519KeyHash, WasmModuleProxy} from '@emurgo/cross-csl-core'
import axios from 'axios'

type PoolIdentity = {
  id: string
  hash: string
}

// note: only include types for required fields.
type ExplorerPoolInfoApiRes = {
  data?: {
    data?: Array<{
      pool_id: string // bech32 identifier
      pool_id_hash_raw: string // HEX key-hash
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

export type ExplorerPoolInfo = {
  id: string // BECH32 identifier
  hash: string // HEX key-hash
  ticker: string // db_ticker
  name: string // db_name
  pic: string | null // pool_pic
  stake: string // total_stake / live_stake
  share?: string // total_size (deprecated, not available in new API)
  roa: string // roa
  saturation: string // saturation
  taxFix: string
  taxRatio: string
}

export type PoolTransition = {
  current: ExplorerPoolInfo
  suggested: ExplorerPoolInfo
  deadlineMilliseconds: number
}

type PoolTransitionOldEntry = [string, number, boolean] // id, deadline, isEnabled
type PoolTransitionOldGroups = {
  [name: string]: Array<PoolTransitionOldEntry>
}
type PoolTransitionNewGroups = {[name: string]: Array<string>}
type TransitionData = {
  new: PoolTransitionNewGroups
  old: PoolTransitionOldGroups
  saturationThreshold?: number
}

export const TRANSITION_DATA_STUB: TransitionData = {
  new: {
    emurgo: [
      'pool1pmm654jfx088td54ekkkd0j28x6r5gnjdhnutzggursrxjnpk2y', // // Pool [EMUR8] Emurgo #8
      'pool1m0drnjxsvnlesq0rwmur2rh6lenuql57jfzd6cf6aegj2cv7ugy', // Pool [EMURA] Emurgo A
      'pool1xkwnlr34tjrnkz6u4c0p36cju3xuls4dyynsdkf6cv22ksuhz6q', // Pool [EMURB] Emurgo B
    ],
    yoroi: [
      'pool1pmm654jfx088td54ekkkd0j28x6r5gnjdhnutzggursrxjnpk2y', // // Pool [EMUR8] Emurgo #8
      'pool192pfftt48zc4x5aellvpufk6l6zxllpldw0rx82vrhqrqfhhqs2', // Pool [YORO1] Yoroi pool 1
      'pool1kx0jm9ycs3t99tnwafw6w72jkdlzhj5ltxe2nrzkd9x2u5x343h', // Pool [YORO2] Yoroi pool 2
    ],
  },
  old: {
    emurgo: [
      // [id, deadline, isEnabled]
      [
        'pool14u30jkg45xwd27kmznz43hxy596lvrrpj0wz8w9a9k97kmt4p2d',
        1722470400000,
        true,
      ], // Pool [EMUR1] Emurgo #1
      [
        'pool1qs6h0y7czzt605kptmrv6cr85kxd6tajr2hs0etvxphv7tr7nqu',
        1722470400000,
        false,
      ], // Pool [EMUR2] Emurgo #2
      [
        'pool1cd987kw92e3nmjywcfwfws79a09rwp0p0xj5mdtr39qukxgp9uf',
        1722470400000,
        false,
      ], // Pool [EMUR3] Emurgo #3
      [
        'pool1c55n72ag3tz8g7rntzuu9a86u7eugsy008xl3xsje8kwgvz2vdz',
        1717200000000,
        true,
      ], // Pool [EMUR4] Emurgo #4
    ],
    yoroi: [
      [
        'pool1mut4phum9hegtl8m2r68gpjh5x8w8t6zwf75zrphhp3qwwrrpgt',
        1717200000000,
        true,
      ], // Pool [YOROI] Yoroi
    ],
  },
}

export const DEFAULT_SATURATION_THRESHOLD = 0.8

export function getMaybeNewEntriesByPool(
  poolId: string,
  transitionData: TransitionData,
): null | {
  newEntries: Array<string>
  deadline: number
} {
  for (const groupName of Object.keys(transitionData.old)) {
    const oldEntries: Array<PoolTransitionOldEntry> | undefined =
      transitionData.old[groupName]
    if (!oldEntries) continue
    const oldEntry: PoolTransitionOldEntry | undefined = oldEntries.find(
      (e) => e[0] === poolId,
    )
    if (oldEntry != null) {
      const [, deadline, isEnabled] = oldEntry
      const newEntries: Array<string> | undefined =
        transitionData.new[groupName]
      return isEnabled && newEntries != null ? {newEntries, deadline} : null
    }
  }
  return null
}

type WasmFactory = (scope: string) => WasmModuleProxy

export async function normalisePoolIdentifierOrKey(
  poolIdOrHash: string,
  wasmFactory: WasmFactory,
): Promise<PoolIdentity> {
  const wasm = wasmFactory('pool-normalize')
  const key: Ed25519KeyHash = await (isHex(poolIdOrHash)
    ? wasm.Ed25519KeyHash.fromHex(poolIdOrHash)
    : wasm.Ed25519KeyHash.fromBech32(poolIdOrHash))
  const [id, hash] = await Promise.all([key.toBech32('pool'), key.toHex()])
  return {id, hash}
}

export type ExplorerPoolInfoMap = Record<string, ExplorerPoolInfo | null>

export type OffChainPoolInfo = {
  name?: string
  description?: string
  ticker?: string
  homepage?: string
}

export type ChainPoolHistory = Array<{
  epoch: number
  slot: number
  tx_ordinal: number
  cert_ordinal: number
  payload: unknown
}>

export type FullChainPoolInfo = {
  info: OffChainPoolInfo
  history: ChainPoolHistory
}

export type ChainPoolInfoMap = Record<string, FullChainPoolInfo | null>

export type FullPoolInfo = {
  chain: FullChainPoolInfo | null
  explorer: ExplorerPoolInfo | null
}

export type FullPoolInfoMap = Record<string, FullPoolInfo | null>

export class PoolInfoApi {
  private readonly apiUrl: string
  private readonly zeroApiUrl: string
  private readonly requestSize = 50
  private transitionSaturationThreshold: number | null = null

  constructor(apiUrl: string, zeroApiUrl: string) {
    this.apiUrl = apiUrl
    this.zeroApiUrl = zeroApiUrl
  }

  /**
   * @param hash HEX key-hash
   */
  public async getSingleFullPoolInfo(
    hash: string,
  ): Promise<FullPoolInfo | null> {
    const result = (await this.getManyFullPoolInfo([hash]))[hash]
    return result ?? null
  }

  /**
   * @param hashes - an array of HEX pool key hashes
   */
  public async getManyFullPoolInfo(hashes: string[]): Promise<FullPoolInfoMap> {
    const [chainInfos, explorerInfos] = await Promise.all([
      this.getManyChainPoolInfo(hashes),
      this.getManyExplorerPoolInfo(hashes),
    ])
    return valueIntoRecord(hashes, (hash) => {
      const chain = chainInfos[hash]
      const explorer = explorerInfos[hash]
      return chain || explorer ? {chain, explorer} : null
    }) as FullPoolInfoMap
  }

  /**
   * @param hash HEX key-hash
   */
  public async getSingleChainPoolInfo(
    hash: string,
  ): Promise<FullChainPoolInfo | null> {
    const result = (await this.getManyChainPoolInfo([hash]))[hash]
    return result ?? null
  }

  /**
   * @param hashes - an array of HEX pool key hashes
   */
  public async getManyChainPoolInfo(
    hashes: string[],
  ): Promise<ChainPoolInfoMap> {
    const responses: Array<ChainPoolInfoMap> = await Promise.all(
      chunk(hashes, this.requestSize).map((batch) =>
        this.getManyChainPoolInfoBatch(batch),
      ),
    )
    return mergeRecords(responses) as ChainPoolInfoMap
  }

  /**
   * Migrated to backend-zero: Uses GET /cexplorer-pool-list
   * Note: History is not available from cexplorer, returns empty history arrays
   */
  private async getManyChainPoolInfoBatch(
    hashes: string[],
  ): Promise<ChainPoolInfoMap> {
    // Query each pool individually using cexplorer proxy
    const poolInfoPromises = hashes.map(async (hash) => {
      try {
        const params = new URLSearchParams({
          limit: '1',
          order: 'ranking',
          poolId: hash,
        })
        const baseUrl = joinUrl(this.zeroApiUrl, '/cexplorer-pool-list')
        const zeroApiPoolsUrl = `${baseUrl}?${params.toString()}`
        const response =
          await axios.get<ExplorerPoolInfoApiRes>(zeroApiPoolsUrl)
        const poolsData: ExplorerPoolInfoApiRes = response.data

        if (!poolsData.data?.data?.length) {
          return [hash, null] as [string, FullChainPoolInfo | null]
        }

        const [pool] = poolsData.data.data
        if (!pool) {
          return [hash, null] as [string, FullChainPoolInfo | null]
        }

        // Map cexplorer response to ChainPoolInfo format
        // Note: History is not available from cexplorer, so we return empty array
        const chainInfo: FullChainPoolInfo = {
          info: {
            name: pool.pool_name.name || undefined,
            ticker: pool.pool_name.ticker || undefined,
            description: undefined, // Not available from cexplorer
            homepage: undefined, // Not available from cexplorer
          },
          history: [], // History not available from cexplorer
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

  /**
   * @param hashes - an array of HEX pool key hashes
   */
  public async getManyExplorerPoolInfo(
    hashes: string[],
  ): Promise<ExplorerPoolInfoMap> {
    const hashInfoTuples = await Promise.all(
      hashes.map(
        async (hash) =>
          [hash, await this.getSingleExplorerPoolInfo(hash)] as [
            string,
            ExplorerPoolInfo | null,
          ],
      ),
    )
    return tuplesIntoRecord(hashInfoTuples) as ExplorerPoolInfoMap
  }

  /**
   * !! DEPRECATED !!
   *
   * @deprecated use `.getSingleExplorerPoolInfo(hash)`
   * @param hash - HEX pool key hash
   */
  public async getPool(hash: string): Promise<ExplorerPoolInfo | null> {
    return this.getSingleExplorerPoolInfo(hash)
  }

  /**
   * @param hash HEX key-hash
   */
  public async getSingleExplorerPoolInfo(
    hash: string,
  ): Promise<ExplorerPoolInfo | null> {
    const params = new URLSearchParams({
      limit: '1',
      order: 'ranking',
      poolId: hash,
    })
    // Construct URL properly: joinUrl doesn't handle query strings, so build it manually
    const baseUrl = joinUrl(this.zeroApiUrl, '/cexplorer-pool-list')
    const zeroApiPoolsUrl = `${baseUrl}?${params.toString()}`
    const response = await axios.get<ExplorerPoolInfoApiRes>(zeroApiPoolsUrl)
    const poolsData: ExplorerPoolInfoApiRes = response.data
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

  private async getFirstUnsaturatedPool(
    poolIds: Array<string>,
    threshold: number,
  ): Promise<ExplorerPoolInfo | null> {
    let pool = null
    for (const suggestedId of poolIds) {
      pool = await this.getPool(suggestedId)
      if (pool === null) continue
      const saturation = Number(pool.saturation)
      if (saturation <= threshold) return pool
    }
    // pick the last pool in case all pools are saturated (> 80%)
    return pool
  }

  private async getPoolTransitionInfo(): Promise<TransitionData | null> {
    try {
      const response = await axios.get<TransitionData>(
        '/v2.1/pools/poolTransitionInfo',
        {baseURL: this.apiUrl},
      )
      if (response.status === 200) {
        return response.data
      }
    } catch (e) {
      const logger = getLogger()
      logger.error(e instanceof Error ? e : new Error(String(e)), {
        origin: 'staking',
        operation: 'getPoolTransitionInfo',
      })
    }
    return null
  }

  /**
   * @param hash HEX key-hash
   * @param wasmFactory
   */
  public async getTransition(
    hash: string,
    wasmFactory: WasmFactory,
  ): Promise<PoolTransition | null> {
    const transitionData = await this.getPoolTransitionInfo()
    if (transitionData == null) return null

    const poolId = await normalisePoolIdentifierOrKey(hash, wasmFactory)
    const suggestion = getMaybeNewEntriesByPool(poolId.id, transitionData)
    if (suggestion == null) return null

    let saturationThreshold =
      this.transitionSaturationThreshold ??
      transitionData.saturationThreshold ??
      DEFAULT_SATURATION_THRESHOLD
    if (saturationThreshold < 0 || saturationThreshold > 1) {
      const logger = getLogger()
      logger.warn(
        `Incorrect saturation threshold value "${saturationThreshold}", expected between 0 and 1. Using default "${DEFAULT_SATURATION_THRESHOLD}"`,
        {origin: 'staking', operation: 'getTransition'},
      )
      saturationThreshold = DEFAULT_SATURATION_THRESHOLD
    }

    const [current, suggested] = await Promise.all([
      this.getPool(hash),
      this.getFirstUnsaturatedPool(suggestion.newEntries, saturationThreshold),
    ])

    if (!current || !suggested) return null

    return {
      current,
      suggested,
      deadlineMilliseconds: suggestion.deadline,
    }
  }
}
