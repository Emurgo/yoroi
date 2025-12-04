import {useTheme} from '@yoroi/theme'

import {
  StackNavigationOptions,
  createStackNavigator,
} from '@react-navigation/stack'
import * as React from 'react'

import {NetworkTag} from '~/features/Settings/ui/shared/NetworkTag'
import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'

import {AirdropMainScreen} from './AirdropMainScreen'
import {DestinationAddressScreen} from './DestinationAddressScreen'
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
        options={{
          title: strings.menu.airdrop,
        }}
        getComponent={() => DestinationAddressScreen}
      />

      <Stack.Screen
        name="airdrop-main"
        options={{
          title: strings.menu.airdrop,
        }}
        getComponent={() => AirdropMainScreen}
      />

      <Stack.Screen
        name="airdrop-thaw-schedule"
        options={{
          title: strings.airdrop.thawSchedule,
        }}
        getComponent={() => ThawScheduleScreen}
      />
    </Stack.Navigator>
  )
}

