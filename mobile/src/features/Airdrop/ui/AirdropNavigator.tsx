import {useTheme} from '@yoroi/theme'

import {
  StackNavigationOptions,
  createStackNavigator,
} from '@react-navigation/stack'
import * as React from 'react'

import {NetworkTag} from '~/features/Settings/ui/shared/NetworkTag'
import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {ResultScreen} from '~/ui/ResultScreen/ResultScreen'

import {AirdropDetailsScreen} from './AirdropDetailsScreen'
import {AirdropSelectionScreen} from './AirdropSelectionScreen'
import {ThawScheduleScreen} from './ThawScheduleScreen'
import type {AirdropRoutes} from './types'

const Stack = createStackNavigator<AirdropRoutes>()

export const AirdropNavigator = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const screenOptions: StackNavigationOptions = React.useMemo(
    () => ({
      ...defaultStackNavigationOptions(p),
      headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
    }),
    [p],
  )

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="airdrop-address"
        component={AirdropSelectionScreen}
        options={{
          title: strings.menu.airdrop,
        }}
      />

      <Stack.Screen
        name="airdrop-main"
        options={{
          title: strings.menu.airdrop,
        }}
        getComponent={() => AirdropDetailsScreen}
      />

      <Stack.Screen
        name="airdrop-thaw-schedule"
        options={{
          title: strings.airdrop.thawSchedule,
        }}
        getComponent={() => ThawScheduleScreen}
      />

      <Stack.Screen
        name="result-screen"
        component={
          ResultScreen as unknown as React.ComponentType<
            Record<string, unknown>
          >
        }
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
}
