// @flow
import React from 'react'
import {createStackNavigator} from 'react-navigation'
import DelegationCenter from './DelegationCenter'
import {STAKING_CENTER_ROUTES} from '../../RoutesList'

import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'

import HeaderBackButton from '../UiKit/HeaderBackButton'

const DelegationNavigatorCenter = createStackNavigator(
  {
    [STAKING_CENTER_ROUTES.MAIN]: {
      screen: DelegationCenter,
      navigationOptions: ({navigation}) => ({
        title: navigation.getParam('title'),
        ...defaultNavigationOptions,
      }),
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

export default DelegationNavigatorCenter
