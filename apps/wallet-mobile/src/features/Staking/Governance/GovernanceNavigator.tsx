import {GovernanceProvider} from '@yoroi/staking'
import {Atoms, ThemedPalette, useTheme} from '@yoroi/theme'
import React from 'react'

import {SafeArea} from '../../../components/SafeArea'
import {defaultStackNavigationOptions} from '../../../kernel/navigation'
import {NetworkTag} from '../../Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {useGovernanceManagerMaker} from './common/helpers'
import {NavigationStack} from './common/navigation'
import {useStrings} from './common/strings'
import {ChangeVoteScreen} from './useCases/ChangeVote/ChangeVoteScreen'
import {HomeScreen} from './useCases/Home/HomeScreen'
import {NoFundsScreen} from './useCases/NoFunds/NoFundsScreen'
import {NotSupportedCardanoAppVersion} from './useCases/NotSupportedCardanoAppVersion/NotSupportedCardanoAppVersion'
import {FailedTxScreen} from './useCases/ShowFailedTxScreen/FailedTxScreen'
import {SubmittedTxScreen} from './useCases/ShowSubmittedTxScreen/SubmittedTxScreen'

const Stack = NavigationStack

export const GovernanceNavigator = () => {
  const strings = useStrings()
  const manager = useGovernanceManagerMaker()
  const {atoms, color} = useTheme()

  return (
    <GovernanceProvider manager={manager}>
      <SafeArea>
        <Stack.Navigator
          screenOptions={{
            ...screenOptions(atoms, color),
            headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
          }}
        >
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
            name="staking-gov-not-supported-version"
            component={NotSupportedCardanoAppVersion}
            options={txStatusOptions}
          />

          <Stack.Screen
            name="staking-gov-no-funds"
            component={NoFundsScreen}
            options={{title: strings.governanceCentreTitle}}
          />

          <Stack.Screen name="staking-gov-submitted-tx" component={SubmittedTxScreen} options={{headerShown: false}} />

          <Stack.Screen name="staking-gov-failed-tx" component={FailedTxScreen} options={{headerShown: false}} />
        </Stack.Navigator>
      </SafeArea>
    </GovernanceProvider>
  )
}

const txStatusOptions = {
  detachPreviousScreen: true,
  header: () => null,
}
const screenOptions = (atoms: Atoms, color: ThemedPalette) => ({
  ...defaultStackNavigationOptions(atoms, color),
  gestureEnabled: true,
})
