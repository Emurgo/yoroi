import {storiesOf} from '@storybook/react-native'
import {tokenBalanceMocks} from '@yoroi/portfolio'
import React from 'react'

import {QueryProvider, RouteProvider} from '../../../../../../../.storybook'
import {YoroiWallet} from '../../../../../../yoroi-wallets/cardano/types'
import {mocks} from '../../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {ZoomMediaImageScreen} from './ZoomMediaImageScreen'

storiesOf('NFT/Details Image', module).add('Default', () => {
  const wallet: YoroiWallet = {
    ...mocks.wallet,
    balances: {
      all: [tokenBalanceMocks.ftNoTicker],
      fts: [tokenBalanceMocks.ftNoTicker],
      nfts: [tokenBalanceMocks.nftCryptoKitty],
      records: new Map([
        [tokenBalanceMocks.ftNoTicker.info.id, tokenBalanceMocks.ftNoTicker],
        [tokenBalanceMocks.nftCryptoKitty.info.id, tokenBalanceMocks.nftCryptoKitty],
      ]),
    },
  }
  return (
    <RouteProvider params={{id: tokenBalanceMocks.nftCryptoKitty.info.id}}>
      <QueryProvider>
        <WalletManagerProviderMock wallet={wallet}>
          <ZoomMediaImageScreen />
        </WalletManagerProviderMock>
      </QueryProvider>
    </RouteProvider>
  )
})
