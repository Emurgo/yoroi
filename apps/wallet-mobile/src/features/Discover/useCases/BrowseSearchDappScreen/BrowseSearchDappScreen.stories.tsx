import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {SelectedWalletProvider} from '../../../../features/WalletManager/Context'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {BrowserProvider} from '../../common/BrowserProvider'
import {BrowseSearchDappScreen} from './BrowseSearchDappScreen'

storiesOf('Discover BrowseSearchDappScreen', module)
  .addDecorator((story) => <SelectedWalletProvider wallet={walletMocks.wallet}>{story()}</SelectedWalletProvider>)
  .add('initial', () => <Initial />)

const Initial = () => {
  return (
    <BrowserProvider>
      <BrowseSearchDappScreen />
    </BrowserProvider>
  )
}
