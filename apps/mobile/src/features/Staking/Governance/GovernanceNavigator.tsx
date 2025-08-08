import {GovernanceProvider} from '@yoroi/staking'
import {Atoms, ThemedPalette, useTheme} from '@yoroi/theme'
import React from 'react'

import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {
  BackButton,
  defaultStackNavigationOptions,
  useWalletNavigation,
} from '~/kernel/navigation'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {useGovernanceManagerMaker} from './common/helpers'
import {NavigationStack} from './common/navigation'
import {useStrings} from '~/kernel/i18n/useStrings'
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
  const {atoms, palette: p} = useTheme()
  const walletNavigation = useWalletNavigation()

  return (
    <GovernanceProvider manager={manager}>
      <SafeArea>
        <Stack.Navigator
          screenOptions={{
            ...screenOptions(atoms, p),
            headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
          }}
          initialRouteName="staking-gov-home"
        >
          <Stack.Screen
            name="staking-gov-home"
            component={HomeScreen}
            options={{
              title: strings.governanceCentreTitle,
              headerLeft: (props) => (
                <BackButton
                  {...props}
                  onPress={() => walletNavigation.navigateToTxHistory()}
                />
              ),
            }}
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

          <Stack.Screen
            name="staking-gov-submitted-tx"
            component={SubmittedTxScreen}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="staking-gov-failed-tx"
            component={FailedTxScreen}
            options={{headerShown: false}}
          />
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
  gestureEnabled: false,
})
