import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {useAuth} from '../../auth/AuthProvider'
import {EnableLoginWithPin} from '../../auth/EnableLoginWithPin'
import {defaultStackNavigationOptionsV2, InititalizationRoutes} from '../../navigation'
import {AnalyticsNoticeScreen} from './AnalyticsNoticeScreen'
import {InitialScreen} from './InitialScreen/InitialScreen'
import {LanguagePickerScreen} from './LanguagePickerScreen'
import {TermsOfServiceScreen} from './TermsOfServiceScreen'

const Stack = createStackNavigator<InititalizationRoutes>()
export const InititalizationNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptionsV2,
        detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
      }}
    >
      <Stack.Screen name="initial" component={InitialScreen} options={{headerShown: false}} />

      <Stack.Screen //
        name="language-pick"
        options={{title: strings.languagePickerTitle}}
        component={LanguagePickerScreen}
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

      <Stack.Screen //
        name="analytics"
        options={{headerShown: false}}
        component={AnalyticsNoticeScreen}
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
    id: 'components.initialization.acepttermsofservicescreen.title',
    defaultMessage: '!!!Terms of Service Agreement',
  },
  languagePickerTitle: {
    id: 'components.initialization.languagepicker.title',
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
