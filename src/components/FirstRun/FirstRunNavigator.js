// @flow
import React from 'react'
import {createStackNavigator} from 'react-navigation'

import LanguagePickerScreen from './LanguagePickerScreen'
import HeaderBackButton from '../UiKit/HeaderBackButton'
import {defaultNavigationOptions} from '../../navigationOptions'
import {FIRST_RUN_ROUTES} from '../../RoutesList'
import AcceptTermsOfServiceScreen from './AcceptTermsOfServiceScreen'

const WalletInitNavigator = createStackNavigator(
  {
    [FIRST_RUN_ROUTES.LANGUAGE]: {
      screen: LanguagePickerScreen,
      navigationOptions: {
        header: null,
      },
    },
    [FIRST_RUN_ROUTES.ACCEPT_TERMS_OF_SERVICE]: AcceptTermsOfServiceScreen,
  },
  {
    initialRouteName: FIRST_RUN_ROUTES.LANGUAGE,
    navigationOptions: ({navigation}) => ({
      title: navigation.getParam('title'),
      headerLeft: <HeaderBackButton navigation={navigation} />,
      ...defaultNavigationOptions,
    }),
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
)

export default WalletInitNavigator
