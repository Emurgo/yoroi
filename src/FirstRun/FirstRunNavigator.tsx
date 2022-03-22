import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../legacy/navigationOptions'
import {CustomPinScreen} from './CustomPinScreen'
import {LanguagePickerScreen} from './LanguagePickerScreen'
import {TermsOfServiceScreen} from './TermsOfServiceScreen'

/* eslint-disable @typescript-eslint/no-explicit-any */
type FirstRunRoute = {
  'language-pick': any
  'accept-terms-of-service': any
  'custom-pin': any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const Stack = createStackNavigator<FirstRunRoute>()

export const FirstRunNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator
      initialRouteName={'language-pick'}
      screenOptions={({route}) => ({
        title: route.params?.title ?? undefined,
        cardStyle: {
          backgroundColor: 'transparent',
        },
        ...defaultNavigationOptions,
        ...defaultStackNavigatorOptions,
      })}
    >
      <Stack.Screen // formatting
        name={'language-pick'}
        component={LanguagePickerScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name={'accept-terms-of-service'}
        component={TermsOfServiceScreen}
        options={{title: strings.acceptTermsTitle}}
      />

      <Stack.Screen // formatting
        name={'custom-pin'}
        component={CustomPinScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
}

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
