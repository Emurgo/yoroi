import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../WalletManager/Context'
import {BrowserProvider} from '../../common/BrowserProvider'
import {WelcomeDAppModal} from './WelcomeDAppModal'

storiesOf('Discover WelcomeDAppModal', module)
  .addDecorator((story) => <SelectedWalletProvider wallet={walletMocks.wallet}>{story()}</SelectedWalletProvider>)
  .add('initial', () => <Initial />)

const Initial = () => {
  return (
    <BrowserProvider>
      <WelcomeDAppModal />
    </BrowserProvider>
  )
}
