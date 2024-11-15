import {AppFrontendFeesResponse} from '../api/app'
import {ChainSupportedNetworks} from '../chain/network'
import {PortfolioTokenAmount} from '../portfolio/amount'
import {PortfolioTokenInfo} from '../portfolio/info'
import {PortfolioTokenId} from '../portfolio/token'
import {SwapApi} from './api'
import {SwapStorage} from './storage'

export type SwapManager = Readonly<{
  clearStorage: SwapStorage['clear']
  slippage: SwapStorage['slippage']
  api: SwapApi
  aggregatorTokenIds: ReadonlyArray<PortfolioTokenId>
  updateAggregatorTokensHeld: (
    values: ReadonlyArray<PortfolioTokenAmount>,
  ) => void
}>

export type SwapManagerMaker = (args: {
  address: string
  addressHex: string
  stakingKey: string
  primaryTokenInfo: PortfolioTokenInfo
  aggregatedFrontendFeeTiers: AppFrontendFeesResponse
  network: ChainSupportedNetworks
  storage: SwapStorage
}) => SwapManager
