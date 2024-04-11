import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../../features/WalletManager/Context'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {BrowserProvider} from '../../common/BrowserProvider'
import {BrowserTabsBar} from './BrowserTabsBar'

storiesOf('Discover BrowserTabsBar', module)
  .addDecorator((story) => <SelectedWalletProvider wallet={walletMocks.wallet}>{story()}</SelectedWalletProvider>)
  .add('initial', () => <Initial />)

const Initial = () => {
  return (
    <BrowserProvider>
      <BrowserTabsBar />
    </BrowserProvider>
  )
}
