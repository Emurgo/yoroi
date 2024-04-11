import {storiesOf} from '@storybook/react-native'
import React from 'react'
import WebView from 'react-native-webview'

import {SelectedWalletProvider} from '../../../../features/WalletManager/Context'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {BrowserProvider} from '../../common/BrowserProvider'
import {BrowserTabBar} from './BrowserTabBar'

storiesOf('Discover BrowserTabBar', module)
  .addDecorator((story) => <SelectedWalletProvider wallet={walletMocks.wallet}>{story()}</SelectedWalletProvider>)
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
