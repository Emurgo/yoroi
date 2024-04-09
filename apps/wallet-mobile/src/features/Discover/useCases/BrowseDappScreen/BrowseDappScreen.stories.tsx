import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {ScrollView} from 'react-native'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {BrowserProvider} from '../../common/BrowserProvider'
import {BrowseDappScreen} from './BrowseDappScreen'

storiesOf('Discover BrowseDappScreen', module)
  .addDecorator((story) => <SelectedWalletProvider wallet={walletMocks.wallet}>{story()}</SelectedWalletProvider>)
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
      <ScrollView>
        <BrowseDappScreen />
      </ScrollView>
    </BrowserProvider>
  )
}
