import AsyncStorage from '@react-native-async-storage/async-storage'
import {governanceApiMaker, governanceManagerMaker, GovernanceProvider} from '@yoroi/staking'
import {GovernanceApi} from '@yoroi/staking'
import React, {useMemo} from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../../components'
import {defaultStackNavigationOptions} from '../../../navigation'
import {useSelectedWallet} from '../../../SelectedWallet'
import {COLORS} from '../../../theme'
import {CardanoMobile} from '../../../yoroi-wallets/wallets'
import {NavigationStack, useStrings} from './common'
import {USE_MOCKED_API} from './config'
import {ChangeVoteScreen, ConfirmTxScreen, FailedTxScreen, HomeScreen, SuccessTxScreen} from './useCases'

const Stack = NavigationStack

const apiMock: GovernanceApi = {
  getDRepById: () =>
    Promise.resolve({
      txId: 'txId',
      epoch: 1,
    }),
}

export const GovernanceNavigator = () => {
  const {networkId} = useSelectedWallet()
  const strings = useStrings()
  const manager = useMemo(
    () =>
      governanceManagerMaker({
        networkId,
        api: USE_MOCKED_API ? apiMock : governanceApiMaker({networkId}),
        cardano: CardanoMobile,
        storage: AsyncStorage,
      }),
    [networkId],
  )
  return (
    <GovernanceProvider manager={manager}>
      <StatusBar type="dark" />

      <SafeAreaView edges={safeAreaEdges} style={styles.root}>
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="home" component={HomeScreen} options={{title: strings.governanceCentreTitle}} />

          <Stack.Screen
            name="change-vote"
            component={ChangeVoteScreen}
            options={{title: strings.governanceCentreTitle}}
          />

          <Stack.Screen name="confirm-tx" component={ConfirmTxScreen} options={{title: strings.confirmTxTitle}} />

          <Stack.Screen name="tx-success" component={SuccessTxScreen} options={txStatusOptions} />

          <Stack.Screen name="tx-failed" component={FailedTxScreen} options={txStatusOptions} />
        </Stack.Navigator>
      </SafeAreaView>
    </GovernanceProvider>
  )
}

const safeAreaEdges = ['bottom', 'left', 'right'] as const

const txStatusOptions = {
  detachPreviousScreen: true,
  header: () => null,
}

const screenOptions = {
  ...defaultStackNavigationOptions,
  detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
  gestureEnabled: true,
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
})
