import {Swap} from '@yoroi/types'

export type CatalogProtocolEntry = {
  aggregator: Swap.Aggregator
  aggregatorDexKey: string
  normalized?: Swap.Protocol
}

export type CatalogData = Readonly<{
  protocols: ReadonlyArray<CatalogProtocolEntry>
  updatedAt: number
  ttlMs: number
}>

export type SwapCatalog = Readonly<{
  get: () => CatalogData | null
  save: (data: CatalogData) => void
  isStale: () => boolean
  resolveProtocol: (
    aggregator: Swap.Aggregator,
    protocol: Swap.Protocol,
  ) => string | undefined
}>

export const makeSwapCatalog = (opts?: {ttlMs?: number}): SwapCatalog => {
  let data: CatalogData | null = null
  const ttlMs = opts?.ttlMs ?? 24 * 60 * 60 * 1000

  return {
    get: () => data,
    save: (next) => {
      data = {
        protocols: next.protocols,
        updatedAt: Date.now(),
        ttlMs,
      }
    },
    isStale: () => {
      if (data == null) return true
      return Date.now() - data.updatedAt > data.ttlMs
    },
    resolveProtocol: (aggregator, protocol) => {
      if (data == null) return undefined
      const entry = data.protocols.find(
        (e) =>
          e.aggregator === aggregator &&
          (e.normalized === protocol || protocol === Swap.Protocol.Unsupported),
      )
      return entry?.aggregatorDexKey
    },
  }
}
