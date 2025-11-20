// PoolInfoApi types and utilities migrated from @emurgo/yoroi-lib
// This file contains types, constants, and utility functions for pool information
import {isHex} from '@yoroi/common'

import type {Ed25519KeyHash, WasmModuleProxy} from '@emurgo/cross-csl-core'

type PoolIdentity = {
  id: string
  hash: string
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

export type PoolTransitionOldEntry = [string, number, boolean] // id, deadline, isEnabled
export type PoolTransitionOldGroups = {
  [name: string]: Array<PoolTransitionOldEntry>
}
export type PoolTransitionNewGroups = {[name: string]: Array<string>}
export type TransitionData = {
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

export type WasmFactory = (scope: string) => WasmModuleProxy

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
