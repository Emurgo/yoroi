import {ChainSupportedNetworks} from '../chain/network'
import {PortfolioTokenInfo} from '../portfolio/info'
import {SwapAggregator} from './aggregator'
import {SwapApi} from './api'
import {SwapStorage} from './storage'

export type SwapManagerConfig = {
  slippage: number
  routingPreference: 'auto' | Array<SwapAggregator>
}

export type SwapManager = Readonly<{
  clearStorage: SwapStorage['clear']
  assignConfig(v: Partial<SwapManagerConfig>): SwapManagerConfig
  config: SwapManagerConfig
  api: SwapApi
}>

export type SwapManagerMaker = (
  args: Readonly<{
    address: string
    addressHex: string
    stakingKey: string
    primaryTokenInfo: PortfolioTokenInfo
    isPrimaryToken(token: string | null | undefined): boolean
    network: ChainSupportedNetworks
    storage: SwapStorage
  }>,
) => SwapManager
