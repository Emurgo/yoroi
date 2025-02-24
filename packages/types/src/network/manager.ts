import {ApiUtxoData, ApiUtxoDataRequest} from '../api/cardano'
import {AppObservableStorage} from '../app/observable-storage'
import {
  ChainCardanoProtocolParams,
  ChainCardanoBestBlock,
} from '../chain/cardano'
import {ChainSupportedNetworks} from '../chain/network'
import {ExplorersExplorer} from '../explorers/explorer'
import {ExplorersManager} from '../explorers/manager'
import {PortfolioTokenInfo} from '../portfolio/info'
import {PortfolioManagerToken} from '../portfolio/manager'

export enum NetworkBlockchains {
  Cardano = 'cardano',
}

type NetworkConfigCardano = {
  blockchain: NetworkBlockchains
  eras: ReadonlyArray<NetworkEraConfig>
  protocolMagic: number

  epoch: Readonly<{
    info: (date: Date) => Readonly<NetworkEpochInfo>
    progress: (date: Date) => Readonly<NetworkEpochProgress>
  }>
}

export type NetworkConfig = {
  network: ChainSupportedNetworks
  isMainnet: boolean
  primaryTokenInfo: PortfolioTokenInfo
  name: string
  chainId: number

  legacyApiBaseUrl: string
} & NetworkConfigCardano

export type NetworkApi = {
  protocolParams: () => Promise<Readonly<ChainCardanoProtocolParams>>
  bestBlock: () => Promise<ChainCardanoBestBlock>
  utxoData: (request: ApiUtxoDataRequest) => Promise<ApiUtxoData>
}

export type NetworkManager = Readonly<
  {
    tokenManager: PortfolioManagerToken
    rootStorage: AppObservableStorage<false>
    legacyRootStorage: AppObservableStorage
    api: Readonly<NetworkApi>
    explorers: Readonly<Record<ExplorersExplorer, ExplorersManager>>
  } & Readonly<NetworkConfig>
>

export type NetworkEraConfig = {
  name: 'byron' | 'shelley'
  start: Date
  end: Date
  slotInSeconds: number
  slotsPerEpoch: number
}

export type NetworkEpochInfo = {
  epoch: number
  start: Date
  end: Date
  era: NetworkEraConfig
  eras: ReadonlyArray<NetworkEraConfig>
}

export type NetworkEpochProgress = {
  progress: number
  currentSlot: number
  absoluteSlot: number
  timeRemaining: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
}
