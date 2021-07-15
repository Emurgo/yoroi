// @flow
import React from 'react'
import {Button} from '../UiKit'
import {createStackNavigator} from '@react-navigation/stack'
import {useSelector} from 'react-redux'

import {walletNameSelector} from '../../selectors'
import StakingDashboard from './StakingDashboard'
import BiometricAuthScreen from '../Send/BiometricAuthScreen'
import {STAKING_DASHBOARD_ROUTES, WALLET_ROOT_ROUTES, SEND_ROUTES} from '../../RoutesList'
import iconGear from '../../assets/img/gear.png'
import {isJormungandr} from '../../config/networks'

import {defaultNavigationOptions, defaultStackNavigatorOptions, jormunNavigationOptions} from '../../navigationOptions'

import styles from '../TxHistory/styles/SettingsButton.style'

type DelegationNavigatorRoutes = {
  'staking-dashboard': any,
  'staking-center': any,
  'biometrics-signing': any,
}

const Stack = createStackNavigator<any, DelegationNavigatorRoutes, any>()

const DelegationNavigatorSummary = () => {
  const walletName = useSelector(walletNameSelector)

  return (
    <Stack.Navigator
      screenOptions={({route}) => {
        // $FlowFixMe mixed is incompatible with number
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
        component={StakingDashboard}
        options={({navigation}) => ({
          title: walletName,
          headerRight: () => (
            <Button
              style={styles.settingsButton}
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

export default DelegationNavigatorSummary
