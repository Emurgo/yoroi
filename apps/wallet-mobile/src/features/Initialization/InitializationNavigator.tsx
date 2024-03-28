import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'

import {useAuth} from '../../auth/AuthProvider'
import {EnableLoginWithPin} from '../../auth/EnableLoginWithPin'
import {defaultStackNavigationOptions, InititalizationRoutes} from '../../navigation'
import {AnalyticsNoticeScreen} from './AnalyticsNoticeScreen'
import {useStrings} from './common'
import {InitialScreen} from './InitialScreen/InitialScreen'
import {LanguagePickerScreen} from './LanguagePickerScreen'
import {ReadPrivacyPolicyScreen} from './ReadPrivacyPolicyScreen'
import {ReadTermsOfServiceScreen} from './ReadTermsOfServiceScreen'

const Stack = createStackNavigator<InititalizationRoutes>()
export const InitializationNavigator = () => {
  const strings = useStrings()
  const {theme} = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions(theme),
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
        name="read-terms-of-service"
        component={ReadTermsOfServiceScreen}
        options={{title: strings.acceptTermsTitle}}
      />

      <Stack.Screen
        name="read-privacy-policy"
        component={ReadPrivacyPolicyScreen}
        options={{title: strings.acceptPrivacyPolicyTitle}}
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
