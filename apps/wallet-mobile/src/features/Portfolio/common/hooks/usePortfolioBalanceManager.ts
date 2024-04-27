import {mountMMKVStorage, observableStorageMaker} from '@yoroi/common'
import {portfolioBalanceManagerMaker, portfolioBalanceStorageMaker} from '@yoroi/portfolio'
import {Chain, Portfolio} from '@yoroi/types'
import * as React from 'react'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'

export const usePortfolioBalanceManager = ({
  tokenManager,
  walletId,
  network,
  primaryTokenInfo,
}: {
  tokenManager: Portfolio.Manager.Token
  walletId: YoroiWallet['id']
  network: Chain.SupportedNetworks
  primaryTokenInfo: Portfolio.Token.Info
}) => {
  return React.useMemo(
    () => buildPortfolioBalanceManager({tokenManager, walletId, network, primaryTokenInfo}),
    [network, primaryTokenInfo, tokenManager, walletId],
  )
}

export const buildPortfolioBalanceManager = ({
  tokenManager,
  walletId,
  network,
  primaryTokenInfo,
}: {
  tokenManager: Portfolio.Manager.Token
  walletId: YoroiWallet['id']
  network: Chain.SupportedNetworks
  primaryTokenInfo: Portfolio.Token.Info
}) => {
  const rootStorage = mountMMKVStorage<Portfolio.Token.Id>({path: `/`, id: `${network}.balance-manager`})
  const walletStorage = rootStorage.join(`${walletId}/`)
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
