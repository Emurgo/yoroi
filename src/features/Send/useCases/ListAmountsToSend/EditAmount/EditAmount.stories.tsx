import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text} from 'react-native'
import {View} from 'react-native'

import {QueryProvider} from '../../../../../../.storybook/decorators/query'
import {AmountItem} from '../../../../../components/AmountItem/AmountItem'
import {SelectedWalletProvider} from '../../../../../SelectedWallet/Context/SelectedWalletContext'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {Amounts} from '../../../../../yoroi-wallets/utils/utils'
import {EditAmountButton} from './EditAmount'

const primaryAmount = Amounts.getAmount(mocks.balances, mocks.wallet.primaryTokenInfo.id)
const secondaryAmount = Amounts.getAmount(
  mocks.balances,
  '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
)

storiesOf('Edit Amount Button', module)
  .add('Fungible non-primary token', () => (
    <QueryProvider>
      <SelectedWalletProvider wallet={mocks.wallet}>
        <View style={{flex: 1, justifyContent: 'center', padding: 16}}>
          <Text>Fungible non-primary token</Text>

          <EditAmountButton onPress={() => action(`onPress`)}>
            <AmountItem amount={secondaryAmount} wallet={mocks.wallet} />
          </EditAmountButton>
        </View>
      </SelectedWalletProvider>
    </QueryProvider>
  ))
  .add('Fungible primary token', () => (
    <QueryProvider>
      <SelectedWalletProvider wallet={mocks.wallet}>
        <View style={{flex: 1, justifyContent: 'center', padding: 16}}>
          <Text>Fungible primary token</Text>

          <EditAmountButton onPress={() => action(`onPress`)}>
            <AmountItem amount={primaryAmount} wallet={mocks.wallet} />
          </EditAmountButton>
        </View>
      </SelectedWalletProvider>
    </QueryProvider>
  ))
