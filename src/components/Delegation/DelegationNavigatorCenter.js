// @flow
import React from 'react'
import {createStackNavigator} from 'react-navigation'

import {Button} from '../UiKit'
import DelegationCenter from './DelegationCenter'
import BiometricAuthScreen from '../Send/BiometricAuthScreen'
import DelegationConfirmation from './DelegationConfirmation'
import {
  WALLET_ROUTES,
  STAKING_CENTER_ROUTES,
  SEND_ROUTES,
} from '../../RoutesList'
import iconGear from '../../assets/img/gear.png'

import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
  shelleyNavigationOptions,
} from '../../navigationOptions'

import HeaderBackButton from '../UiKit/HeaderBackButton'
import styles from '../TxHistory/styles/SettingsButton.style'

const DelegationNavigatorCenter = createStackNavigator(
  {
    [STAKING_CENTER_ROUTES.MAIN]: {
      screen: DelegationCenter,
      navigationOptions: ({navigation}) => ({
        title: navigation.getParam('title'),
        headerRight: (
          <Button
            style={styles.settingsButton}
            onPress={() => navigation.navigate(WALLET_ROUTES.SETTINGS)}
            iconImage={iconGear}
            title=""
            withoutBackground
          />
        ),
      }),
    },
    [STAKING_CENTER_ROUTES.DELEGATION_CONFIRM]: {
      screen: DelegationConfirmation,
    },
    [SEND_ROUTES.BIOMETRICS_SIGNING]: {
      screen: BiometricAuthScreen,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: STAKING_CENTER_ROUTES.MAIN,
    navigationOptions: ({navigation}) => ({
      title: navigation.getParam('title'),
      headerLeft: <HeaderBackButton navigation={navigation} />,
      ...defaultNavigationOptions,
      ...shelleyNavigationOptions,
    }),
    ...defaultStackNavigatorOptions,
  },
)

export default DelegationNavigatorCenter
