import {storiesOf} from '@storybook/react-native'
import {tokenBalanceMocks} from '@yoroi/portfolio'
import * as React from 'react'

import {QueryProvider} from '../../../../../../../.storybook/decorators'
import {YoroiWallet} from '../../../../../../wallets/cardano/types'
import {mocks} from '../../../../../../wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../../wallets/mocks/WalletManagerProviderMock'
import {SearchProvider} from '../../../../../Search/SearchContext'
import {ListMediaGalleryScreen} from './ListMediaGalleryScreen'

storiesOf('NFT/Gallery', module)
  .add('Default', () => {
    const wallet: YoroiWallet = {
      ...mocks.wallet,
      balances: {
        all: [tokenBalanceMocks.ftNoTicker],
        fts: [tokenBalanceMocks.ftNoTicker],
        nfts: [tokenBalanceMocks.nftCryptoKitty],
        records: new Map([
          [tokenBalanceMocks.ftNoTicker.info.id, tokenBalanceMocks.ftNoTicker],
          [
            tokenBalanceMocks.nftCryptoKitty.info.id,
            tokenBalanceMocks.nftCryptoKitty,
          ],
        ]),
      },
    }
    return (
      <QueryProvider>
        <WalletManagerProviderMock wallet={wallet}>
          <SearchProvider>
            <ListMediaGalleryScreen />
          </SearchProvider>
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
  .add('Empty', () => {
    const wallet: YoroiWallet = {
      ...mocks.wallet,
      balances: {
        all: [tokenBalanceMocks.ftNoTicker],
        fts: [tokenBalanceMocks.ftNoTicker],
        nfts: [],
        records: new Map([
          [tokenBalanceMocks.ftNoTicker.info.id, tokenBalanceMocks.ftNoTicker],
        ]),
      },
    }
    return (
      <QueryProvider>
        <WalletManagerProviderMock wallet={wallet}>
          <SearchProvider>
            <ListMediaGalleryScreen />
          </SearchProvider>
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
