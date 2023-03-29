import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text, View} from 'react-native'

import {QueryProvider} from '../../../../../.storybook/decorators'
import {Spacer} from '../../../../components'
import {AssetItem} from '../../../../components/AssetItem'
import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks} from '../../../../yoroi-wallets/mocks'
import {Amounts} from '../../../../yoroi-wallets/utils/utils'
import {RemoveToken} from './RemoveToken'

const primaryAmount = Amounts.getAmount(mocks.balances, mocks.wallet.primaryTokenInfo.id)
const secondaryAmount = Amounts.getAmount(
  mocks.balances,
  '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
)

storiesOf('Send/SelectedTokens/RemoveToken', module).add('Gallery', () => (
  <QueryProvider>
    <SelectedWalletProvider wallet={mocks.wallet}>
      <View style={{flex: 1, justifyContent: 'center', padding: 16}}>
        <Text>Fungible primary token</Text>

        <RemoveToken
          tokenId={primaryAmount.tokenId}
          onDelete={(tokenId: string) => action(`onDelete ${tokenId}`)}
          style={{borderColor: 'lightgray', borderWidth: 1, padding: 16, borderRadius: 8}}
        >
          <AssetItem amount={primaryAmount} wallet={mocks.wallet} />
        </RemoveToken>

        <Spacer height={40} />

        <Text>Fungible non-primary token</Text>

        <RemoveToken
          tokenId={secondaryAmount.tokenId}
          onDelete={(tokenId: string) => action(`onDelete ${tokenId}`)}
          style={{borderColor: 'lightgray', borderWidth: 1, padding: 16, borderRadius: 8}}
        >
          <AssetItem amount={secondaryAmount} wallet={mocks.wallet} />
        </RemoveToken>
      </View>
    </SelectedWalletProvider>
  </QueryProvider>
))
