import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {BrowserProvider} from '../../common/BrowserProvider'
import {SearchDappInBrowserScreen} from './SearchDappInBrowserScreen'

storiesOf('Discover SearchDappInBrowserScreen', module)
  .addDecorator((story) => <WalletManagerProviderMock wallet={walletMocks.wallet}>{story()}</WalletManagerProviderMock>)
  .add('initial', () => <Initial />)

const Initial = () => {
  return (
    <BrowserProvider>
      <SearchDappInBrowserScreen />
    </BrowserProvider>
  )
}
