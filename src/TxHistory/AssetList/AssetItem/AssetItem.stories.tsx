import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text, View} from 'react-native'

import {mocks, QueryProvider} from '../../../../storybook'
import {Spacer} from '../../../components'
import {SelectedWalletProvider} from '../../../SelectedWallet'
import {AssetItem} from './AssetItem'

storiesOf('AssetItem', module).add('Gallery', () => (
  <QueryProvider>
    <SelectedWalletProvider wallet={mocks.wallet}>
      <View style={{flex: 1, justifyContent: 'center', padding: 16}}>
        <Text>Fungible primary token</Text>

        <AssetItem tokenInfo={mocks.wallet.primaryTokenInfo} onPress={action('onPress')} />

        <Spacer height={40} />

        <Text>Fungible non-primary token</Text>

        <AssetItem
          tokenInfo={mocks.tokenInfos['698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950']}
          onPress={action('onPress')}
        />
      </View>
    </SelectedWalletProvider>
  </QueryProvider>
))
