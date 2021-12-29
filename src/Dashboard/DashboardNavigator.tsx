/* eslint-disable @typescript-eslint/no-explicit-any */
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {useSelector} from 'react-redux'

import iconGear from '../../legacy/assets/img/gear.png'
import BiometricAuthScreen from '../../legacy/components/Send/BiometricAuthScreen'
import {Button} from '../../legacy/components/UiKit'
import {isJormungandr} from '../../legacy/config/networks'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
  jormunNavigationOptions,
} from '../../legacy/navigationOptions'
import {SEND_ROUTES, STAKING_DASHBOARD_ROUTES, WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {walletNameSelector} from '../../legacy/selectors'
import {Dashboard} from './Dashboard'

const Stack = createStackNavigator<{
  'staking-dashboard': any
  'staking-center': any
  'biometrics-signing': any
}>()

export const DashboardNavigator = () => {
  const walletName = useSelector(walletNameSelector)

  return (
    <Stack.Navigator
      screenOptions={({route}) => {
        const extraOptions = isJormungandr(route.params?.networkId) ? jormunNavigationOptions : {}
        return {
          cardStyle: {
            backgroundColor: 'transparent',
          },
          title: route.params?.title ?? undefined,
          ...defaultNavigationOptions,
          ...defaultStackNavigatorOptions,
          ...extraOptions,
        }
      }}
      initialRouteName={STAKING_DASHBOARD_ROUTES.MAIN}
    >
      <Stack.Screen
        name={STAKING_DASHBOARD_ROUTES.MAIN}
        component={Dashboard}
        options={({navigation}) => ({
          title: walletName,
          headerRight: () => (
            <Button
              onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)}
              iconImage={iconGear}
              title=""
              withoutBackground
            />
          ),
        })}
      />
      <Stack.Screen
        name={SEND_ROUTES.BIOMETRICS_SIGNING}
        component={BiometricAuthScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
}
