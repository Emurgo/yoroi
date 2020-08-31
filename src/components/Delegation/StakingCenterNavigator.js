// @flow
import React from 'react'
import {createStackNavigator} from 'react-navigation'

import {Button} from '../UiKit'
import StakeByIdScreen from './StakeByIdScreen'
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
} from '../../navigationOptions'

import HeaderBackButton from '../UiKit/HeaderBackButton'
import styles from '../TxHistory/styles/SettingsButton.style'

const StakingNavigatorCenter = createStackNavigator(
  {
    [STAKING_CENTER_ROUTES.MAIN]: {
      // this should be temporal. Implement StakingCenter in next iteration
      screen: StakeByIdScreen,
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
    }),
    ...defaultStackNavigatorOptions,
  },
)

export default StakingNavigatorCenter
