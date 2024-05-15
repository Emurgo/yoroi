import {Chain} from '@yoroi/types'
import * as React from 'react'
import {FlatList, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer} from '../../../components'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {useWalletManager} from '../../WalletManager/context/WalletManagerContext'

export const PortfolioScreen = () => {
  const manager = useWalletManager()
  const [openedWalletsByNetwork] = React.useState<Map<Chain.SupportedNetworks, Set<YoroiWallet['id']>>>(
    manager.getOpenedWalletsByNetwork(),
  )
  const [canWipe, setCanWipe] = React.useState(!manager.isSyncActive && !manager.isSyncing)
  const [isActive, setIsActive] = React.useState(manager.isSyncActive)

  React.useEffect(() => {
    const subSyncActivity = manager.syncActive$.subscribe((isActive) => {
      setIsActive(isActive)
      setCanWipe(() => !isActive && !manager.isSyncing)
    })
    const subIsSyncing = manager.syncing$.subscribe((isSyncing) => {
      setCanWipe(() => !isSyncing)
    })

    return () => {
      subSyncActivity.unsubscribe()
      subIsSyncing.unsubscribe()
    }
  })

  const handleOnReset = () => {
    manager.pauseSyncing()
    openedWalletsByNetwork.forEach((walletIds, network) => {
      const tm = manager.getTokenManager(network)
      walletIds.forEach((walletId) => {
        const wallet = manager.getOpenedWalletById(walletId)
        if (wallet) wallet.balanceManager.clear()
      })
      tm.clear({sourceId: 'PortfolioScreen'})
    })
  }

  const handleOnSync = () => {
    if (!isActive) {
      manager.resumeSyncing()
    } else {
      manager.pauseSyncing()
    }
  }

  return (
    <SafeAreaView edges={['bottom', 'top', 'left', 'right']}>
      <View style={{padding: 16}}>
        <Text>Portfolio playground</Text>

        <Text>{manager.isSyncActive ? 'active' : 'stopped'}</Text>

        <Spacer height={16} />

        <Button title={!isActive ? 'start sync' : 'stop sync'} onPress={handleOnSync} shelleyTheme />

        <Spacer height={16} />

        <Button title="reset" onPress={handleOnReset} outlineShelley disabled={!canWipe} />

        <Spacer height={16} />

        {Array.from(openedWalletsByNetwork).map(([network, walletIds]) => {
          return Array.from(walletIds).map((walletId, index) => {
            const wallet = manager.getOpenedWalletById(walletId)
            return (
              <View key={walletId}>
                {index === 0 && <Text>{network}</Text>}

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
