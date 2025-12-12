// Re-export types for convenience
export type {
  ExplorerPoolInfo,
  PoolTransition,
  ExplorerPoolInfoMap,
  OffChainPoolInfo,
  ChainPoolHistory,
  FullChainPoolInfo,
  ChainPoolInfoMap,
  FullPoolInfo,
  FullPoolInfoMap,
} from './pool-info-api'

// API request/response types
export type StakePoolInfoRequest = {
  poolIds: Array<string>
}

type StakePoolInfo = {
  name?: string
  ticker?: string
  description?: string
  homepage?: string
  // other stuff from SMASH.
}

type RemoteCertificate = {
  kind: 'PoolRegistration' | 'PoolRetirement'
  certIndex: number
  poolParams: Record<string, unknown> // don't think this is relevant
}

type StakePoolHistory = Array<{
  epoch: number
  slot: number
  tx_ordinal: number
  cert_ordinal: number
  payload: RemoteCertificate
}>

export type StakePoolInfoAndHistory = {
  info: StakePoolInfo
  history: StakePoolHistory
}

export type StakePoolInfosAndHistories = Record<
  string,
  StakePoolInfoAndHistory | null
>
