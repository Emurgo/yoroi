import {Chain} from '@yoroi/types'
import * as React from 'react'
import {FlatList, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer} from '../../../components'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'

export const PortfolioScreen = () => {
  const {walletManager} = useWalletManager()
  const [openedWalletsByNetwork] = React.useState<Map<Chain.SupportedNetworks, Set<YoroiWallet['id']>>>(
    walletManager.getWalletsByNetwork(),
  )
  const [canWipe, setCanWipe] = React.useState(!walletManager.isSyncActive && !walletManager.isSyncing)
  const [isActive, setIsActive] = React.useState(walletManager.isSyncActive)

  React.useEffect(() => {
    const subSyncActivity = walletManager.syncActive$.subscribe((isActive) => {
      setIsActive(isActive)
      setCanWipe(() => !isActive && !walletManager.isSyncing)
    })
    const subIsSyncing = walletManager.syncing$.subscribe((isSyncing) => {
      setCanWipe(() => !isSyncing)
    })

    return () => {
      subSyncActivity.unsubscribe()
      subIsSyncing.unsubscribe()
    }
  })

  const handleOnReset = () => {
    walletManager.pauseSyncing()
    openedWalletsByNetwork.forEach((walletIds, network) => {
      const tm = walletManager.getTokenManager(network)
      walletIds.forEach((walletId) => {
        const wallet = walletManager.getWalletById(walletId)
        if (wallet) wallet.balanceManager.clear()
      })
      tm.clear({sourceId: 'PortfolioScreen'})
    })
  }

  const handleOnSync = () => {
    if (!isActive) {
      walletManager.resumeSyncing()
    } else {
      walletManager.pauseSyncing()
    }
  }

  return (
    <SafeAreaView edges={['bottom', 'top', 'left', 'right']}>
      <View style={{padding: 16}}>
        <Text>Portfolio playground</Text>

        <Text>{walletManager.isSyncActive ? 'active' : 'stopped'}</Text>

        <Spacer height={16} />

        <Button title={!isActive ? 'start sync' : 'stop sync'} onPress={handleOnSync} shelleyTheme />

        <Spacer height={16} />

        <Button title="reset" onPress={handleOnReset} outlineShelley disabled={!canWipe} />

        <Spacer height={16} />

        {Array.from(openedWalletsByNetwork).map(([network, walletIds]) => {
          return Array.from(walletIds).map((walletId, index) => {
            const wallet = walletManager.getWalletById(walletId)
            return (
              <View key={walletId}>
                {index === 0 && <Text>{network}</Text>}

                {wallet && (
                  <FlatList
                    style={{height: 120}}
                    ListHeaderComponent={() => {
                      return (
                        <View>
                          <Text>wallet: {walletId}</Text>

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
