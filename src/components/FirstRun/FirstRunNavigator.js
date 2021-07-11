// @flow
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import {defineMessages, injectIntl} from 'react-intl'

import LanguagePickerScreen from './LanguagePickerScreen'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'
import {FIRST_RUN_ROUTES} from '../../RoutesList'
import AcceptTermsOfServiceScreen from './AcceptTermsOfServiceScreen'
import CustomPinScreen from './CustomPinScreen'

import type {IntlShape} from 'react-intl'

const messages = defineMessages({
  acceptTermsTitle: {
    id: 'components.firstrun.acepttermsofservicescreen.title',
    defaultMessage: '!!!Terms of Service Agreement',
    description: 'some desc',
  },
})

type FirstRunRoute = {
  'language-pick': any,
  'accept-terms-of-service': any,
  'custom-pin': any,
}

const Stack = createStackNavigator<any, FirstRunRoute, any>()

const FirstRunNavigator = injectIntl(({intl}: {intl: IntlShape}) => (
  <Stack.Navigator
    initialRouteName={FIRST_RUN_ROUTES.LANGUAGE}
    screenOptions={({route}) => {
      return {
        // $FlowFixMe mixed is incompatible with string
        title: route.params?.title ?? undefined,
        cardStyle: {
          backgroundColor: 'transparent',
        },
        ...defaultNavigationOptions,
        ...defaultStackNavigatorOptions,
      }
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
      options={{title: intl.formatMessage(messages.acceptTermsTitle)}}
    />
    <Stack.Screen
      name={FIRST_RUN_ROUTES.CUSTOM_PIN}
      component={CustomPinScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
))

export default FirstRunNavigator
