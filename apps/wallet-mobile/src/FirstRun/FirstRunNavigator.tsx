import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {useAuth} from '../auth/AuthProvider'
import {EnableLoginWithPin} from '../auth/EnableLoginWithPin'
import {defaultStackNavigationOptions, FirstRunRoutes} from '../navigation'
import {LanguagePickerScreen} from './LanguagePickerScreen'
import {TermsOfServiceScreen} from './TermsOfServiceScreen'

const Stack = createStackNavigator<FirstRunRoutes>()
export const FirstRunNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator
      screenOptions={{
        cardStyle: {backgroundColor: 'transparent'},
        ...defaultStackNavigationOptions,
        detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
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
        name="enable-login-with-pin"
        options={{headerShown: false}}
        component={CreatePinScreenWrapper}
      />
    </Stack.Navigator>
  )
}

const CreatePinScreenWrapper = () => {
  const {login} = useAuth()

  return <EnableLoginWithPin onDone={login} />
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
