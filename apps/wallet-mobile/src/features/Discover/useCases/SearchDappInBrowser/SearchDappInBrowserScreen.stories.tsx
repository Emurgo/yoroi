import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../WalletManager/context/SelectedWalletContext'
import {BrowserProvider} from '../../common/BrowserProvider'
import {SearchDappInBrowserScreen} from './SearchDappInBrowserScreen'

storiesOf('Discover SearchDappInBrowserScreen', module)
  .addDecorator((story) => <SelectedWalletProvider wallet={walletMocks.wallet}>{story()}</SelectedWalletProvider>)
  .add('initial', () => <Initial />)

const Initial = () => {
  return (
    <BrowserProvider>
      <SearchDappInBrowserScreen />
    </BrowserProvider>
  )
}
