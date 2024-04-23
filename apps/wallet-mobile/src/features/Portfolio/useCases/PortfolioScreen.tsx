import {useNavigation} from '@react-navigation/native'
import {useObserver} from '@yoroi/common'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {Text, View} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer} from '../../../components'
import {WalletMeta} from '../../../wallet-manager/types'
import {useWalletManager} from '../../../wallet-manager/WalletManagerContext'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {useSelectedWallet} from '../../WalletManager/Context'
import {usePortfolioBalanceManager} from '../common/usePortfolioBalanceManager'
import {usePortfolioTokenManager} from '../common/usePortfolioTokenManager'

type OpenWallets = Record<number, Array<Partial<YoroiWallet & WalletMeta>>>
export const PortfolioScreen = () => {
  const navigation = useNavigation()
  const manager = useWalletManager()
  const wallet = useSelectedWallet()
  const [openedWalletsByNetwork, setOpenedWalletsByNetwork] = React.useState<OpenWallets>({})

  React.useEffect(() => {
    manager.listWallets().then(async (walletMetas) => {
      const walletsPerNetwork: OpenWallets = {}

      for (const meta of walletMetas) {
        const wallet = await manager.openWallet(meta)
        if (walletsPerNetwork[wallet.networkId] == null) walletsPerNetwork[wallet.networkId] = []
        walletsPerNetwork[wallet.networkId].push({
          id: wallet.id,
          name: meta.name,
          utxos: wallet.utxos,
        })
      }

      setOpenedWalletsByNetwork(walletsPerNetwork)

      for (const networkId in walletsPerNetwork) {
        const wallets = walletsPerNetwork[networkId]
        for (const wallet of wallets) {
          console.log(wallet.name)
          if (wallet.utxos == null) continue
          for (const utxo of wallet.utxos) {
            for (const record of utxo.assets) {
              console.log(record.assetId)
            }
          }
        }
      }
    })
  }, [manager, openedWalletsByNetwork])

  const {tokenManager, tokenStorage} = usePortfolioTokenManager({network: Chain.Network.Main})
  const {balanceManager: bmW1, balanceStorage: bs1} = usePortfolioBalanceManager({
    tokenManager,
    walletId: wallet.id,
    network: Chain.Network.Main,
  })

  // wallet 2 for testing
  const {balanceManager: bmW2, balanceStorage: bs2} = usePortfolioBalanceManager({
    tokenManager,
    walletId: 'wallet-2',
    network: Chain.Network.Main,
  })
  const {data: balancesW2, isPending: isPendingW2} = useObserver({
    observable: bmW2.observable,
    executor: () => bmW2.getBalances().all,
  })
  // end of wallet 2

  const {data: balances, isPending} = useObserver({
    observable: bmW1.observable,
    executor: () => bmW1.getBalances().all,
  })
  const opacity = isPending || isPendingW2 ? 0.5 : 1

  const handleOnSync = () => {
    bmW1.sync({
      primaryBalance: {
        balance: 1n,
        lockedInBuiltTxs: 2n,
        minRequiredByTokens: 0n,
        records: [],
      },
      secondaryBalances: new Map([]),
    })

    bmW2.sync({
      primaryBalance: {
        balance: 2n,
        lockedInBuiltTxs: 3n,
        minRequiredByTokens: 0n,
        records: [],
      },
      secondaryBalances: new Map([]),
    })
  }

  const handleOnReset = () => {
    bs1.clear()
    bs2.clear()
    tokenStorage.clear()
    navigation.goBack()
  }

  return (
    <SafeAreaView edges={['bottom', 'top', 'left', 'right']}>
      <View style={{padding: 16}}>
        <Text>Portfolio playground</Text>

        <Spacer height={16} />

        <Button title="sync" onPress={handleOnSync} shelleyTheme />

        <Spacer height={16} />

        <Button title="reset" onPress={handleOnReset} outlineShelley />

        <Spacer height={16} />

        <Text>w1 {wallet.id}</Text>

        <Text>all: {balances.length}</Text>

        <FlatList
          data={balances}
          keyExtractor={(item) => item.info.id}
          renderItem={({item}) => (
            <View style={{padding: 8, backgroundColor: 'lightgray', marginVertical: 4, opacity}}>
              <Text>{item.info.name}</Text>

              <Text>{item.balance.toString()}</Text>
            </View>
          )}
        />

        <Text>wallet 2</Text>

        <Text>all: {balances.length}</Text>

        <FlatList
          data={balancesW2}
          keyExtractor={(item) => item.info.id}
          renderItem={({item}) => (
            <View style={{padding: 8, backgroundColor: 'lightgray', marginVertical: 4, opacity}}>
              <Text>{item.info.name}</Text>

              <Text>{item.balance.toString()}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  )
}
