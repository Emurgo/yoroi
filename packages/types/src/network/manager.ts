import {AppObservableStorage} from '../app/observable-storage'
import {ChainSupportedNetworks} from '../chain/network'
import {PortfolioTokenInfo} from '../portfolio/info'
import {PortfolioManagerToken} from '../portfolio/manager'

export type NetworkConfig = {
  network: ChainSupportedNetworks
  primaryTokenInfo: PortfolioTokenInfo
  chainId: number
  eras: ReadonlyArray<NetworkEraConfig>
  name: string
  isMainnet: boolean
  protocolMagic: number

  legacyApiBaseUrl: string
}

// NOTE: NetworkConfig will be a generic type in the future
export type NetworkManager = {
  tokenManager: PortfolioManagerToken
  rootStorage: AppObservableStorage<false>
  legacyRootStorage: AppObservableStorage
} & NetworkConfig

export type NetworkEraConfig = {
  name: 'byron' | 'shelley'
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

export type NetworkEpochProgress = {
  progress: number
  currentSlot: number
  timeRemaining: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
}
