// @flow

import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../legacy/navigationOptions'
import AcceptTermsOfServiceScreen from './AcceptTermsOfServiceScreen'
import CustomPinScreen from './CustomPinScreen'
import LanguagePickerScreen from './LanguagePickerScreen'

/* eslint-disable @typescript-eslint/no-explicit-any */
type FirstRunRoute = {
  'language-pick': any
  'accept-terms-of-service': any
  'custom-pin': any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const Stack = createStackNavigator<FirstRunRoute>()

const FirstRunNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator
      initialRouteName={'language-pick'}
      screenOptions={({route}) => {
        return {
          title: route.params?.title ?? undefined,
          cardStyle: {
            backgroundColor: 'transparent',
          },
          ...defaultNavigationOptions,
          ...defaultStackNavigatorOptions,
        }
      }}
    >
      <Stack.Screen name={'language-pick'} component={LanguagePickerScreen} options={{headerShown: false}} />
      <Stack.Screen
        name={'accept-terms-of-service'}
        component={AcceptTermsOfServiceScreen}
        options={{title: strings.acceptTermsTitle}}
      />
      <Stack.Screen name={'custom-pin'} component={CustomPinScreen} options={{headerShown: false}} />
    </Stack.Navigator>
  )
}
export default FirstRunNavigator

const messages = defineMessages({
  acceptTermsTitle: {
    id: 'components.firstrun.acepttermsofservicescreen.title',
    defaultMessage: '!!!Terms of Service Agreement',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    acceptTermsTitle: intl.formatMessage(messages.acceptTermsTitle),
  }
}
