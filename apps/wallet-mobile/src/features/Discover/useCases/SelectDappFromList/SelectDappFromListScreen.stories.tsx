import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SearchProvider} from '../../../Search/SearchContext'
import {BrowserProvider} from '../../common/BrowserProvider'
import {SelectDappFromListScreen} from './SelectDappFromListScreen'

storiesOf('Discover SelectDappFromListScreen', module)
  .addDecorator((story) => <WalletManagerProviderMock wallet={walletMocks.wallet}>{story()}</WalletManagerProviderMock>)
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
