import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {BrowserProvider} from '../../common/BrowserProvider'
import {WebViewItem} from './WebViewItem'

storiesOf('Discover WebViewItem', module)
  .addDecorator((story) => <WalletManagerProviderMock wallet={walletMocks.wallet}>{story()}</WalletManagerProviderMock>)
  .add('initial', () => <Initial />)

const Initial = () => {
  const mockTab = {
    id: '1',
    url: 'https://www.google.com',
  } as const

  return (
    <BrowserProvider
      initialState={{
        tabs: [mockTab],
        tabActiveIndex: 0,
      }}
    >
      <WebViewItem tab={mockTab} index={0} />
    </BrowserProvider>
  )
}
