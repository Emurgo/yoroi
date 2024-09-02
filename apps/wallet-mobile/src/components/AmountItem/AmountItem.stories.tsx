import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text, View} from 'react-native'

import {QueryProvider} from '../../../.storybook/decorators'
import {mocks} from '../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {Amounts} from '../../yoroi-wallets/utils'
import {Spacer} from '..'
import {AmountItem} from './AmountItem'

const primaryAmount = Amounts.getAmount(mocks.balances, mocks.wallet.portfolioPrimaryTokenInfo.id)
const secondaryAmount = Amounts.getAmount(
  mocks.balances,
  '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
)

storiesOf('AmountItem', module)
  .add('Gallery', () => (
    <QueryProvider>
      <WalletManagerProviderMock wallet={mocks.wallet}>
        <View style={{flex: 1, justifyContent: 'center', padding: 16}}>
          <Text>Fungible primary token</Text>

          <AmountItem
            wallet={mocks.wallet}
            amount={primaryAmount}
            style={{backgroundColor: 'white', padding: 16, borderRadius: 8}}
          />

          <Spacer height={40} />

          <Text>Fungible non-primary token</Text>

          <AmountItem
            wallet={mocks.wallet}
            amount={secondaryAmount}
            style={{backgroundColor: 'white', padding: 16, borderRadius: 8}}
          />
        </View>
      </WalletManagerProviderMock>
    </QueryProvider>
  ))
  .add('Loading', () => (
    <QueryProvider>
      <WalletManagerProviderMock
        wallet={{
          ...mocks.wallet,
          fetchTokenInfo: mocks.fetchTokenInfo.loading,
        }}
      >
        <View style={{flex: 1, justifyContent: 'center', padding: 16}}>
          <AmountItem
            wallet={mocks.wallet}
            amount={primaryAmount}
            style={{backgroundColor: 'white', padding: 16, borderRadius: 8}}
          />
        </View>
      </WalletManagerProviderMock>
    </QueryProvider>
  ))
  .add('Error', () => (
    <QueryProvider>
      <WalletManagerProviderMock
        wallet={{
          ...mocks.wallet,
          fetchTokenInfo: mocks.fetchTokenInfo.error,
        }}
      >
        <View style={{flex: 1, justifyContent: 'center', padding: 16}}>
          <AmountItem
            wallet={mocks.wallet}
            amount={primaryAmount}
            style={{backgroundColor: 'white', padding: 16, borderRadius: 8}}
          />
        </View>
      </WalletManagerProviderMock>
    </QueryProvider>
  ))
