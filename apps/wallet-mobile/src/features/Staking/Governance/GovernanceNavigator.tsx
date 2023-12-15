import AsyncStorage from '@react-native-async-storage/async-storage'
import {governanceApiMaker, governanceManagerMaker, GovernanceProvider} from '@yoroi/staking'
import React, {useMemo} from 'react'

import {StatusBar} from '../../../components'
import {defaultStackNavigationOptions} from '../../../navigation'
import {useSelectedWallet} from '../../../SelectedWallet'
import {CardanoMobile} from '../../../yoroi-wallets/wallets'
import {NavigationStack, SafeArea, useStrings} from './common'
import {ChangeVoteScreen, ConfirmTxScreen, FailedTxScreen, HomeScreen, SuccessTxScreen} from './useCases'

const Stack = NavigationStack

export const GovernanceNavigator = () => {
  const {networkId} = useSelectedWallet()
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const manager = useMemo(
    () =>
      governanceManagerMaker({
        walletId: wallet.id,
        networkId,
        api: governanceApiMaker({networkId}),
        cardano: CardanoMobile,
        storage: AsyncStorage,
      }),
    [networkId, wallet.id],
  )
  return (
    <GovernanceProvider manager={manager}>
      <StatusBar type="dark" />

      <SafeArea>
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
      </SafeArea>
    </GovernanceProvider>
  )
}

const txStatusOptions = {
  detachPreviousScreen: true,
  header: () => null,
}

const screenOptions = {
  ...defaultStackNavigationOptions,
  detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
  gestureEnabled: true,
}
