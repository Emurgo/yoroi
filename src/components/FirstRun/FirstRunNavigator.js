// @flow
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

import LanguagePickerScreen from './LanguagePickerScreen'
import HeaderBackButton from '../UiKit/HeaderBackButton'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'
import {FIRST_RUN_ROUTES} from '../../RoutesList'
import AcceptTermsOfServiceScreen from './AcceptTermsOfServiceScreen'
import CustomPinScreen from './CustomPinScreen'

// TODO: remove
const WalletInitNavigator = // createStackNavigator(
[
  {
    [FIRST_RUN_ROUTES.LANGUAGE]: {
      screen: LanguagePickerScreen,
      navigationOptions: {
        header: null,
      },
    },
    [FIRST_RUN_ROUTES.ACCEPT_TERMS_OF_SERVICE]: AcceptTermsOfServiceScreen,
    [FIRST_RUN_ROUTES.CUSTOM_PIN]: {
      screen: CustomPinScreen,
      navigationOptions: {
        header: null,
      },
    },
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
    ...defaultStackNavigatorOptions,
  },
]

const Stack = createStackNavigator()

const FirstRunNavigator = () => (
  <Stack.Navigator
    initialRouteName={FIRST_RUN_ROUTES.LANGUAGE}
    screenOptions={({route}) => {
      return ({
        title: route.params?.title ?? undefined,
        cardStyle: {
          backgroundColor: 'transparent',
        },
        ...defaultNavigationOptions,
        ...defaultStackNavigatorOptions,
      })
    }}
  >
    <Stack.Screen
      name={FIRST_RUN_ROUTES.LANGUAGE}
      component={LanguagePickerScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name={FIRST_RUN_ROUTES.ACCEPT_TERMS_OF_SERVICE}
      component={AcceptTermsOfServiceScreen}
    />
    <Stack.Screen
      name={FIRST_RUN_ROUTES.CUSTOM_PIN}
      component={CustomPinScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
)


export default FirstRunNavigator
