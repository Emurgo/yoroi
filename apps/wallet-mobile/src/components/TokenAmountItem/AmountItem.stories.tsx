import {storiesOf} from '@storybook/react-native'
import {tokenMocks} from '@yoroi/portfolio'
import React from 'react'
import {Text, View} from 'react-native'

import {QueryProvider} from '../../../.storybook/decorators'
import {SelectedWalletProvider} from '../../features/WalletManager/Context'
import {mocks} from '../../yoroi-wallets/mocks'
import {Spacer} from '..'
import {AmountItem} from './AmountItem'

const primaryAmount = tokenMocks.primaryETH.balance
const secondaryAmount = tokenMocks.nftCryptoKitty.balance

storiesOf('AmountItem', module).add('Gallery', () => (
  <QueryProvider>
    <SelectedWalletProvider wallet={mocks.wallet}>
      <View style={{flex: 1, justifyContent: 'center', padding: 16}}>
        <Text>Fungible primary token</Text>

        <AmountItem
          privacyPlaceholder="-"
          wallet={mocks.wallet}
          amount={primaryAmount}
          style={{backgroundColor: 'white', padding: 16, borderRadius: 8}}
        />

        <Spacer height={40} />

        <Text>Fungible non-primary token</Text>

        <AmountItem
          privacyPlaceholder="-"
          wallet={mocks.wallet}
          amount={secondaryAmount}
          style={{backgroundColor: 'white', padding: 16, borderRadius: 8}}
        />
      </View>
    </SelectedWalletProvider>
  </QueryProvider>
))
