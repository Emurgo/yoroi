import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {FlatList, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer} from '../../../components'
import {useWalletManager} from '../../../wallet-manager/WalletManagerContext'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {NetworkId} from '../../../yoroi-wallets/types'
import {toChainSupportedNetwork} from '../common/transformers/toChainSupportedNetwork'

export const PortfolioScreen = () => {
  const navigation = useNavigation()
  const manager = useWalletManager()
  const [openedWalletsByNetwork] = React.useState<Map<NetworkId, Set<YoroiWallet['id']>>>(
    manager.getOpenedWalletsByNetwork(),
  )

  const handleOnReset = () => {
    navigation.goBack()
  }

  return (
    <SafeAreaView edges={['bottom', 'top', 'left', 'right']}>
      <View style={{padding: 16}}>
        <Text>Portfolio playground</Text>

        <Spacer height={16} />

        <Button title="sync" onPress={() => console.log('sync')} shelleyTheme />

        <Spacer height={16} />

        <Button title="reset" onPress={handleOnReset} outlineShelley />

        <Spacer height={16} />

        {Array.from(openedWalletsByNetwork).map(([networkId, walletIds]) => {
          return Array.from(walletIds).map((walletId, index) => {
            const wallet = manager.getOpenedWalletById(walletId)
            return (
              <View key={walletId}>
                {index === 0 && <Text>{toChainSupportedNetwork(networkId)}</Text>}

                {wallet && (
                  <FlatList
                    style={{height: 120}}
                    ListHeaderComponent={() => {
                      return (
                        <View>
                          <Text>walelt: {walletId}</Text>

                          <Text>balance: {wallet.primaryBalance.quantity.toString()}</Text>

                          <Text>locked: {wallet.primaryBreakdown.lockedAsStorageCost.toString()}</Text>
                        </View>
                      )
                    }}
                    data={wallet.balances.all}
                    keyExtractor={(item) => item.info.id}
                    renderItem={({item}) => (
                      <View style={{padding: 8, backgroundColor: 'lightgray', marginVertical: 4}}>
                        <Text>{item.info.name}</Text>

                        <Text>{item.quantity.toString()}</Text>
                      </View>
                    )}
                  />
                )}
              </View>
            )
          })
        })}
      </View>
    </SafeAreaView>
  )
}
