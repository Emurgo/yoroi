import {GovernanceProvider} from '@yoroi/staking'
import {ThemedPalette, useTheme} from '@yoroi/theme'

import * as React from 'react'

import {NetworkTag} from '~/features/Settings/ui/shared/NetworkTag'
import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {SafeArea} from '~/ui/SafeArea/SafeArea'

import {useGovernanceManagerMaker} from './common/helpers'
import {NavigationStack} from './common/navigation'
import {ChangeVoteScreen} from './useCases/ChangeVote/ChangeVoteScreen'
import {HomeScreen} from './useCases/Home/HomeScreen'
import {NotSupportedCardanoAppVersion} from './useCases/NotSupportedCardanoAppVersion/NotSupportedCardanoAppVersion'
import {VotingOptionsScreen} from './useCases/VotingOptions/VotingOptionsScreen'

const Stack = NavigationStack

export const GovernanceNavigator = () => {
  const strings = useStrings()
  const manager = useGovernanceManagerMaker()
  const {palette: p} = useTheme()

  if (!manager) {
    return null
  }

  return (
    <GovernanceProvider manager={manager}>
      <SafeArea>
        <Stack.Navigator
          screenOptions={{
            ...screenOptions(p),
            headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
          }}
          initialRouteName="staking-gov-home"
        >
          <Stack.Screen
            name="staking-gov-home"
            component={HomeScreen}
            options={{
              title: strings.staking.governanceCentreTitle,
            }}
          />

          <Stack.Screen
            name="staking-gov-change-vote"
            component={ChangeVoteScreen}
            options={{title: strings.staking.governanceCentreTitle}}
          />

          <Stack.Screen
            name="staking-gov-voting-options"
            component={VotingOptionsScreen}
            options={{title: strings.staking.otherGovernanceOptions}}
          />

          <Stack.Screen
            name="staking-gov-not-supported-version"
            component={NotSupportedCardanoAppVersion}
            options={txStatusOptions}
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
const screenOptions = (color: ThemedPalette) => ({
  ...defaultStackNavigationOptions(color),
  gestureEnabled: false,
})
