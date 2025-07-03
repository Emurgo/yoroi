import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {mocks as walletMocks} from '../../../../wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../wallets/mocks/WalletManagerProviderMock'
import {BrowserProvider} from '../../common/BrowserProvider'
import {BrowserTabsBar} from './BrowserTabsBar'

storiesOf('Discover BrowserTabsBar', module)
  .addDecorator((story) => (
    <WalletManagerProviderMock wallet={walletMocks.wallet}>
      {story()}
    </WalletManagerProviderMock>
  ))
  .add('initial', () => <Initial />)

const Initial = () => {
  return (
    <BrowserProvider>
      <BrowserTabsBar />
    </BrowserProvider>
  )
}
