import {storiesOf} from '@storybook/react-native'
import {tokenMocks} from '@yoroi/portfolio'
import React from 'react'
import {Text, View} from 'react-native'

import {QueryProvider} from '../../../../../.storybook/decorators'
import {Spacer} from '../../../../components'
import {mocks} from '../../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {TokenAmountItem} from './TokenAmountItem'

const primaryAmount = tokenMocks.primaryETH.balance
const secondaryAmount = tokenMocks.nftCryptoKitty.balance

storiesOf('TokenAmountItem', module).add('Gallery', () => (
  <QueryProvider>
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <View style={{flex: 1, justifyContent: 'center', padding: 16}}>
        <Text>Fungible primary token</Text>

        <TokenAmountItem amount={primaryAmount} style={{backgroundColor: 'white', padding: 16, borderRadius: 8}} />

        <Spacer height={40} />

        <Text>Fungible non-primary token</Text>

        <TokenAmountItem amount={secondaryAmount} style={{backgroundColor: 'white', padding: 16, borderRadius: 8}} />
      </View>
    </WalletManagerProviderMock>
  </QueryProvider>
))
