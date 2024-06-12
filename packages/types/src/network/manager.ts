import {AppStorage} from '../app/storage'
import {ChainSupportedNetworks} from '../chain/network'
import {PortfolioTokenInfo} from '../portfolio/info'
import {PortfolioManagerToken} from '../portfolio/manager'
import {PortfolioTokenId} from '../portfolio/token'

export type NetworkConfig = {
  network: ChainSupportedNetworks
  primaryTokenInfo: PortfolioTokenInfo
  chainId: number
  eras: ReadonlyArray<NetworkEraConfig>
  name: string
  isMainnet: boolean
}

// NOTE: NetworkConfig will be a generic type in the future
export type NetworkManager = {
  tokenManager: PortfolioManagerToken
  rootStorage: AppStorage<false, PortfolioTokenId>
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
