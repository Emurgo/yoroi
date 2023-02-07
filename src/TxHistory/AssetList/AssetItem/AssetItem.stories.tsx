import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text, View} from 'react-native'

import {mocks, QueryProvider} from '../../../../storybook'
import {Spacer} from '../../../components'
import {SelectedWalletProvider} from '../../../SelectedWallet'
import {AssetItem} from './AssetItem'

const primaryTokenInfo = mocks.wallet.primaryTokenInfo
const primaryBalance = mocks.balances[primaryTokenInfo.id]

const tokenInfo = mocks.tokenInfos['698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950']
const tokenBalance = mocks.balances['698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950']

storiesOf('AssetItem', module).add('Gallery', () => (
  <QueryProvider>
    <SelectedWalletProvider wallet={mocks.wallet}>
      <View style={{flex: 1, justifyContent: 'center', padding: 16}}>
        <Text>Fungible primary token</Text>

        <AssetItem tokenInfo={primaryTokenInfo} balance={primaryBalance} />

        <Spacer height={40} />

        <Text>Fungible non-primary token</Text>

        <AssetItem tokenInfo={tokenInfo} balance={tokenBalance} />
      </View>
    </SelectedWalletProvider>
  </QueryProvider>
))
