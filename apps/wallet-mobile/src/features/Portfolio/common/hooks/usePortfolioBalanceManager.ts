import {mountMMKVStorage, observableStorageMaker} from '@yoroi/common'
import {createPrimaryTokenInfo, portfolioBalanceManagerMaker, portfolioBalanceStorageMaker} from '@yoroi/portfolio'
import {Chain, Portfolio} from '@yoroi/types'
import * as React from 'react'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'

export const usePortfolioBalanceManager = ({
  tokenManager,
  walletId,
  network,
}: {
  tokenManager: Portfolio.Manager.Token
  walletId: YoroiWallet['id']
  network: Chain.Network
}) => {
  return React.useMemo(
    () => buildPortfolioBalanceManager({tokenManager, walletId, network}),
    [network, tokenManager, walletId],
  )
}

export const buildPortfolioBalanceManager = ({
  tokenManager,
  walletId,
  network,
}: {
  tokenManager: Portfolio.Manager.Token
  walletId: YoroiWallet['id']
  network: Chain.Network
}) => {
  const primaryTokenInfo = network === Chain.Network.Main ? primaryTokenInfoMainnet : primaryTokenInfoAnyTestnet
  const balanceStorageMounted = mountMMKVStorage<Portfolio.Token.Id>({path: `/balance/${walletId}/`})
  const primaryBreakdownStorageMounted = mountMMKVStorage<Portfolio.Token.Id>({
    path: `/primary-breakdown/${walletId}/`,
  })

  const balanceStorage = portfolioBalanceStorageMaker({
    balanceStorage: observableStorageMaker(balanceStorageMounted),
    primaryBreakdownStorage: observableStorageMaker(primaryBreakdownStorageMounted),
    primaryTokenId: primaryTokenInfo.id,
  })

  const balanceManager = portfolioBalanceManagerMaker({
    tokenManager,
    storage: balanceStorage,
    primaryToken: {
      info: primaryTokenInfo,
      discovery: {
        counters: {
          items: 0,
          supply: 45n * BigInt(1e9),
          totalItems: 0,
        },
        id: primaryTokenInfo.id,
        originalMetadata: {
          filteredMintMetadatum: null,
          referenceDatum: null,
          tokenRegistry: null,
        },
        properties: {},
        source: {
          decimals: Portfolio.Token.Source.Metadata,
          name: Portfolio.Token.Source.Metadata,
          ticker: Portfolio.Token.Source.Metadata,
          symbol: Portfolio.Token.Source.Metadata,
          image: Portfolio.Token.Source.Metadata,
        },
      },
    },
    sourceId: walletId,
  })

  balanceManager.hydrate()
  return {
    balanceManager,
    balanceStorage,
  }
}

const primaryTokenInfoMainnet = createPrimaryTokenInfo({
  decimals: 6,
  name: 'ADA',
  ticker: 'ADA',
  symbol: '₳',
  reference: '',
  tag: '',
  website: 'https://www.cardano.org/',
  originalImage: '',
})

const primaryTokenInfoAnyTestnet = createPrimaryTokenInfo({
  decimals: 6,
  name: 'TADA',
  ticker: 'TADA',
  symbol: '₳',
  reference: '',
  tag: '',
  website: 'https://www.cardano.org/',
  originalImage: '',
})
