// @flow
import React from 'react'
import {createStackNavigator} from 'react-navigation'
import DelegationCenter from './DelegationCenter'
import {SHELLEY_WALLET_ROUTES} from '../../RoutesList'

import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'

import HeaderBackButton from '../UiKit/HeaderBackButton'

const DelegationNavigatorCenter = createStackNavigator(
  {
    [SHELLEY_WALLET_ROUTES.STAKING_CENTER]: {
      screen: DelegationCenter,
      navigationOptions: ({navigation}) => ({
        title: navigation.getParam('title'),
        ...defaultNavigationOptions,
      }),
    },
  },
  {
    initialRouteName: SHELLEY_WALLET_ROUTES.STAKING_CENTER,
    navigationOptions: ({navigation}) => ({
      title: navigation.getParam('title'),
      headerLeft: <HeaderBackButton navigation={navigation} />,
      ...defaultNavigationOptions,
    }),
    ...defaultStackNavigatorOptions,
  },
)

export default DelegationNavigatorCenter
