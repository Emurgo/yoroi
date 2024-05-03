import {storiesOf} from '@storybook/react-native'
import {tokenMocks} from '@yoroi/portfolio'
import {Chain} from '@yoroi/types'
import React from 'react'
import {Text, View} from 'react-native'

import {QueryProvider} from '../../../../../.storybook/decorators'
import {Spacer} from '../../../../components'
import {mocks} from '../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../WalletManager/Context'
import {TokenAmountItem} from './TokenAmountItem'

const primaryAmount = tokenMocks.primaryETH.balance
const secondaryAmount = tokenMocks.nftCryptoKitty.balance

storiesOf('TokenAmountItem', module).add('Gallery', () => (
  <QueryProvider>
    <SelectedWalletProvider wallet={mocks.wallet}>
      <View style={{flex: 1, justifyContent: 'center', padding: 16}}>
        <Text>Fungible primary token</Text>

        <TokenAmountItem
          privacyPlaceholder="-"
          network={Chain.Network.Mainnet}
          isPrivacyOff={false}
          amount={primaryAmount}
          style={{backgroundColor: 'white', padding: 16, borderRadius: 8}}
        />

        <Spacer height={40} />

        <Text>Fungible non-primary token</Text>

        <TokenAmountItem
          privacyPlaceholder="-"
          network={Chain.Network.Mainnet}
          isPrivacyOff={false}
          amount={secondaryAmount}
          style={{backgroundColor: 'white', padding: 16, borderRadius: 8}}
        />
      </View>
    </SelectedWalletProvider>
  </QueryProvider>
))
