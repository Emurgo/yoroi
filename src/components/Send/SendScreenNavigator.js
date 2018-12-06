// @flow

import React from 'react'
import {createStackNavigator} from 'react-navigation'
import SendScreen from './SendScreen'
import ConfirmScreen from './ConfirmScreen'
import AddressReaderQR from './AddressReaderQR'
import SendingModal from './SendingModal'
import BiometricAuthScreen from './BiometricAuthScreen'

import HeaderBackButton from '../UiKit/HeaderBackButton'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'

import {SEND_ROUTES} from '../../RoutesList'

const SendScreenNavigator = createStackNavigator(
  {
    [SEND_ROUTES.MAIN]: SendScreen,
    [SEND_ROUTES.ADDRESS_READER_QR]: AddressReaderQR,
    [SEND_ROUTES.CONFIRM]: ConfirmScreen,
    [SEND_ROUTES.SENDING_MODAL]: {
      screen: SendingModal,
      navigationOptions: {
        header: null,
      },
    },
    [SEND_ROUTES.BIOMETRICS_SIGNING]: {
      screen: BiometricAuthScreen,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: SEND_ROUTES.MAIN,
    navigationOptions: ({navigation}) => ({
      title: navigation.getParam('title'),
      headerLeft: <HeaderBackButton navigation={navigation} />,
      ...defaultNavigationOptions,
    }),
    ...defaultStackNavigatorOptions,
  },
)

export default SendScreenNavigator
