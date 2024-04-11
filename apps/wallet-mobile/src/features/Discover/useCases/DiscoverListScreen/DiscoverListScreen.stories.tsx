import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {SelectedWalletProvider} from '../../../../features/WalletManager/Context'
import {SearchProvider} from '../../../../Search/SearchContext'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {BrowserProvider} from '../../common/BrowserProvider'
import {DiscoverListScreen} from './DiscoverListScreen'

storiesOf('Discover DiscoverListScreen', module)
  .addDecorator((story) => <SelectedWalletProvider wallet={walletMocks.wallet}>{story()}</SelectedWalletProvider>)
  .add('initial', () => <Initial />)
  .add('searching dapp', () => <SearchDApp />)

const Initial = () => {
  return (
    <SearchProvider>
      <BrowserProvider>
        <DiscoverListScreen />
      </BrowserProvider>
    </SearchProvider>
  )
}

const SearchDApp = () => {
  return (
    <SearchProvider
      initialState={{
        search: 'SundaeSwap',
        visible: true,
      }}
    >
      <BrowserProvider>
        <DiscoverListScreen />
      </BrowserProvider>
    </SearchProvider>
  )
}
