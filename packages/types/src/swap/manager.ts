import {ChainSupportedNetworks} from '../chain/network'
import {PortfolioTokenInfo} from '../portfolio/info'
import {SwapApi} from './api'
import {SwapStorage} from './storage'

export type SwapManager = Readonly<{
  clearStorage: SwapStorage['clear']
  slippage: SwapStorage['slippage']
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
