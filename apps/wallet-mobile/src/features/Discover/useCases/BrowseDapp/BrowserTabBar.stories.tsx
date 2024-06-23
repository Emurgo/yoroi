import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import WebView from 'react-native-webview'

import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {BrowserProvider} from '../../common/BrowserProvider'
import {BrowserTabBar} from './BrowserTabBar'

storiesOf('Discover BrowserTabBar', module)
  .addDecorator((story) => <WalletManagerProviderMock wallet={walletMocks.wallet}>{story()}</WalletManagerProviderMock>)
  .add('initial', () => <Initial />)

const mockWebviewState = {
  url: 'https://www.google.com',
  canGoBack: false,
  canGoForward: false,
  title: 'Google',
} as const

const Initial = () => {
  const webViewRef = React.useRef<WebView>(null)

  return (
    <BrowserProvider>
      <BrowserTabBar webViewRef={webViewRef} webViewState={mockWebviewState} />
    </BrowserProvider>
  )
}
