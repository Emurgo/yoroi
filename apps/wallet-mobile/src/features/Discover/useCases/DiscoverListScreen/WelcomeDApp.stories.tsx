import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {BrowserProvider} from '../../common/BrowserProvider'
import {WelcomeDApp} from './WelcomeDApp'

storiesOf('Discover WelcomeDApp', module)
  .addDecorator((story) => <SelectedWalletProvider wallet={walletMocks.wallet}>{story()}</SelectedWalletProvider>)
  .add('initial', () => <Initial />)

const Initial = () => {
  return (
    <BrowserProvider>
      <WelcomeDApp />
    </BrowserProvider>
  )
}
