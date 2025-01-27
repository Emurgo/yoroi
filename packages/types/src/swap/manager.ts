import {ChainSupportedNetworks} from '../chain/network'
import {PortfolioTokenInfo} from '../portfolio/info'
import {SwapAggregator, SwapApi} from './api'
import {SwapStorage} from './storage'

export type SwapManagerConfig = {
  adapter: 'auto' | SwapAggregator
}

export type SwapManager = Readonly<{
  clearStorage: SwapStorage['clear']
  slippage: SwapStorage['slippage']
  assignConfig(v: SwapManagerConfig): SwapManagerConfig
  config: SwapManagerConfig
  api: SwapApi
}>

export type SwapManagerMaker = (args: {
  address: string
  addressHex: string
  stakingKey: string
  primaryTokenInfo: PortfolioTokenInfo
  network: ChainSupportedNetworks
  storage: SwapStorage
}) => SwapManager
