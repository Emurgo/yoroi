import {ChainSupportedNetworks} from '../chain/network'
import {PortfolioTokenInfo} from '../portfolio/info'
import {SwapAggregatorSelected} from './aggregator'
import {SwapApi} from './api'
import {SwapStorage} from './storage'

export type SwapManagerConfig = {
  aggregatorSelected: SwapAggregatorSelected
}

export type SwapManager = Readonly<{
  clearStorage: SwapStorage['clear']
  slippage: SwapStorage['slippage']
  assignConfig(v: SwapManagerConfig): SwapManagerConfig
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
