import {mountMMKVStorage, observableStorageMaker} from '@yoroi/common'
import {createPrimaryTokenInfo, portfolioBalanceManagerMaker, portfolioBalanceStorageMaker} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'

import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'

export const usePortfolioBalanceManager = ({
  tokenManager,
  walletId,
}: {
  tokenManager: Portfolio.Manager.Token
  walletId: YoroiWallet['id']
}) => {
  return React.useMemo(() => {
    const balanceStorageMounted = mountMMKVStorage<Portfolio.Token.Id>({path: `balance/${walletId}/`})
    const primaryBreakdownStorageMounted = mountMMKVStorage<Portfolio.Token.Id>({
      path: `/primary-breakdown/${walletId}/`,
    })

    const balanceStorage = portfolioBalanceStorageMaker({
      balanceStorage: observableStorageMaker(balanceStorageMounted),
      primaryBreakdownStorage: observableStorageMaker(primaryBreakdownStorageMounted),
    })

    const balanceManager = portfolioBalanceManagerMaker({
      tokenManager,
      storage: balanceStorage,
      primaryToken: {
        info: primaryTokenInfo,
        discovery: {
          counters: {
            items: 0,
            supply: 0n,
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
  }, [tokenManager, walletId])
}

const primaryTokenInfo = createPrimaryTokenInfo({
  decimals: 6,
  name: 'ADA',
  ticker: 'ADA',
  symbol: '$',
  reference: '',
  tag: '',
  website: '',
  originalImage: '',
})
