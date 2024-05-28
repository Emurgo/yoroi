import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {SearchProvider} from '../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../WalletManager/context/SelectedWalletContext'
import {BrowserProvider} from '../../common/BrowserProvider'
import {SelectDappFromListScreen} from './SelectDappFromListScreen'

storiesOf('Discover SelectDappFromListScreen', module)
  .addDecorator((story) => <SelectedWalletProvider wallet={walletMocks.wallet}>{story()}</SelectedWalletProvider>)
  .add('initial', () => <Initial />)
  .add('searching dapp', () => <SearchDApp />)

const Initial = () => {
  return (
    <SearchProvider>
      <BrowserProvider>
        <SelectDappFromListScreen />
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
        <SelectDappFromListScreen />
      </BrowserProvider>
    </SearchProvider>
  )
}
