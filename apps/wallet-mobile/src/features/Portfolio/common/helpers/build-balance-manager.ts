import {observableStorageMaker} from '@yoroi/common'
import {portfolioBalanceManagerMaker, portfolioBalanceStorageMaker} from '@yoroi/portfolio'
import {App, Portfolio} from '@yoroi/types'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'

export const buildPortfolioBalanceManager =
  ({
    networkRootStorage,
    tokenManager,
    primaryTokenInfo,
  }: {
    networkRootStorage: App.Storage<false, Portfolio.Token.Id>
    tokenManager: Portfolio.Manager.Token
    primaryTokenInfo: Portfolio.Token.Info
  }) =>
  (walletId: YoroiWallet['id']) => {
    const walletStorage = networkRootStorage.join(`${walletId}/`)
    const walletBalanceStorage = walletStorage.join('secondaries/')
    const walletPrimaryBreakdownStorage = walletStorage.join('primary/')

    const balanceStorage = portfolioBalanceStorageMaker({
      balanceStorage: observableStorageMaker(walletBalanceStorage),
      primaryBreakdownStorage: observableStorageMaker(walletPrimaryBreakdownStorage),
      primaryTokenId: primaryTokenInfo.id,
    })

    const balanceManager = portfolioBalanceManagerMaker({
      tokenManager,
      storage: balanceStorage,
      primaryTokenInfo,
      sourceId: walletId,
    })

    balanceManager.hydrate()
    balanceManager.refresh()

    return {
      balanceManager,
      balanceStorage,
    }
  }
