import {useNavigation} from '@react-navigation/native'
import {useObserver} from '@yoroi/common'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {Text, View} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer} from '../../../components'
import {useSelectedWallet} from '../../WalletManager/Context'
import {usePortfolioBalanceManager} from '../common/usePortfoiloBalanceManager'
import {usePortfolioTokenManager} from '../common/usePortfolioTokenManager'

export const PortfolioScreen = () => {
  const navigation = useNavigation()
  const wallet = useSelectedWallet()
  const {tokenManager, tokenStorage} = usePortfolioTokenManager({network: Chain.Network.Main})
  const {balanceManager: bmW1, balanceStorage: bs1} = usePortfolioBalanceManager({
    tokenManager,
    walletId: wallet.id,
  })

  // wallet 2 for testing
  const {balanceManager: bmW2, balanceStorage: bs2} = usePortfolioBalanceManager({
    tokenManager,
    walletId: 'wallet-2',
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
      secondaryBalances: new Map([
        ['14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.34', {balance: 2n, lockedInBuiltTxs: 0n}],
        ['14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.35', {balance: 3n, lockedInBuiltTxs: 0n}],
        ['14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.36', {balance: 4n, lockedInBuiltTxs: 0n}],
      ]),
    })

    bmW2.sync({
      primaryBalance: {
        balance: 2n,
        lockedInBuiltTxs: 3n,
        minRequiredByTokens: 0n,
        records: [],
      },
      secondaryBalances: new Map([
        ['14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.3130', {balance: 222n, lockedInBuiltTxs: 0n}],
        ['14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.35', {balance: 223n, lockedInBuiltTxs: 0n}],
        ['14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.3131', {balance: 224n, lockedInBuiltTxs: 0n}],
        ['14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.3132', {balance: 224n, lockedInBuiltTxs: 0n}],
      ]),
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
