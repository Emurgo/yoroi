import {Portfolio} from '@yoroi/types'

export type NetworkConfig = {
  primaryTokenInfo: Portfolio.Token.Info
  chainId: number
  eras: ReadonlyArray<NetworkEraConfig>
}

export type NetworkEraConfig = {
  name: 'byron' | 'shelley' | 'conway'
  start: Date
  end: Date | undefined
  slotInSeconds: number
  slotsPerEpoch: number
}

export type NetworkEpochInfo = {
  epoch: number
  start: Date
  end: Date
  era: NetworkEraConfig
}
