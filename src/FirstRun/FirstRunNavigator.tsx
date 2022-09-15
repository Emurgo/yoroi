import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {useAuth} from '../auth/AuthProvider'
import {LinkAuthWithPin} from '../auth/LinkAuthWithPin'
import {defaultStackNavigationOptions, FirstRunRoutes} from '../navigation'
import {LanguagePickerScreen} from './LanguagePickerScreen'
import {TermsOfServiceScreen} from './TermsOfServiceScreen'

const Stack = createStackNavigator<FirstRunRoutes>()
export const FirstRunNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator
      initialRouteName="language-pick"
      screenOptions={{
        cardStyle: {
          backgroundColor: 'transparent',
        },
        ...defaultStackNavigationOptions,
      }}
    >
      <Stack.Screen //
        name="language-pick"
        component={LanguagePickerScreen}
        options={{title: strings.languagePickerTitle}}
      />

      <Stack.Screen
        name="accept-terms-of-service"
        component={TermsOfServiceScreen}
        options={{title: strings.acceptTermsTitle}}
      />

      <Stack.Screen //
        name="link-auth-with-pin"
        options={{headerShown: false}}
        component={CreatePinScreenWrapper}
      />
    </Stack.Navigator>
  )
}

const CreatePinScreenWrapper = () => {
  const {login} = useAuth()

  return <LinkAuthWithPin onDone={login} />
}

const messages = defineMessages({
  acceptTermsTitle: {
    id: 'components.firstrun.acepttermsofservicescreen.title',
    defaultMessage: '!!!Terms of Service Agreement',
  },
  languagePickerTitle: {
    id: 'components.firstrun.languagepicker.title',
    defaultMessage: '!!!Select Language',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    acceptTermsTitle: intl.formatMessage(messages.acceptTermsTitle),
    languagePickerTitle: intl.formatMessage(messages.languagePickerTitle),
  }
}
