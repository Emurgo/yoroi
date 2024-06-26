import {GovernanceProvider} from '@yoroi/staking'
import {Atoms, ThemedPalette, useTheme} from '@yoroi/theme'
import React from 'react'

import {SafeArea} from '../../../components/SafeArea'
import {defaultStackNavigationOptions} from '../../../kernel/navigation'
import {NavigationStack, useGovernanceManagerMaker, useStrings} from './common'
import {ChangeVoteScreen, ConfirmTxScreen, FailedTxScreen, HomeScreen, SuccessTxScreen} from './useCases'

const Stack = NavigationStack

export const GovernanceNavigator = () => {
  const strings = useStrings()
  const manager = useGovernanceManagerMaker()
  const {atoms, color, isDark} = useTheme()

  return (
    <GovernanceProvider manager={manager}>
      <SafeArea>
        <Stack.Navigator screenOptions={screenOptions(atoms, color, isDark)}>
          <Stack.Screen
            name="staking-gov-home"
            component={HomeScreen}
            options={{title: strings.governanceCentreTitle}}
          />

          <Stack.Screen
            name="staking-gov-change-vote"
            component={ChangeVoteScreen}
            options={{title: strings.governanceCentreTitle}}
          />

          <Stack.Screen
            name="staking-gov-confirm-tx"
            component={ConfirmTxScreen}
            options={{title: strings.confirmTxTitle}}
          />

          <Stack.Screen name="staking-gov-tx-success" component={SuccessTxScreen} options={txStatusOptions} />

          <Stack.Screen name="staking-gov-tx-failed" component={FailedTxScreen} options={txStatusOptions} />
        </Stack.Navigator>
      </SafeArea>
    </GovernanceProvider>
  )
}

const txStatusOptions = {
  detachPreviousScreen: true,
  header: () => null,
}
const screenOptions = (atoms: Atoms, color: ThemedPalette, isDark: boolean) => ({
  ...defaultStackNavigationOptions(atoms, color, isDark),
  gestureEnabled: true,
})
