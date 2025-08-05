import {atoms as a, useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {InititalizationRoutes} from '~/kernel/navigation/types'
import {InitiatePinScreen} from '~/features/Auth/ui/screens/InitiatePinScreen'

import {AnalyticsNoticeScreen} from '../screens/AnalyticsNoticeScreen'
import {InitialScreen} from '../screens/InitialScreen'
import {LanguagePickerScreen} from '../screens/LanguagePickerScreen'
import {ReadPrivacyPolicyScreen} from '../screens/ReadPrivacyPolicyScreen'
import {ReadTermsOfServiceScreen} from '../screens/ReadTermsOfServiceScreen'

const Stack = createStackNavigator<InititalizationRoutes>()
export const InitializationNavigator = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions(a, p),
      }}
    >
      <Stack.Screen
        name="initial"
        component={InitialScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen //
        name="language-pick"
        options={{title: strings.initialization.languagePickerTitle}}
        component={LanguagePickerScreen}
      />

      <Stack.Screen
        name="read-terms-of-service"
        component={ReadTermsOfServiceScreen}
        options={{title: strings.initialization.acceptTermsTitle}}
      />

      <Stack.Screen
        name="read-privacy-policy"
        component={ReadPrivacyPolicyScreen}
        options={{title: strings.initialization.acceptPrivacyPolicyTitle}}
      />

      <Stack.Screen //
        name="enable-login-with-pin"
        options={{headerShown: false}}
        component={InitiatePinScreen}
      />

      <Stack.Screen //
        name="analytics"
        options={{headerShown: false}}
        component={AnalyticsNoticeScreen}
      />
    </Stack.Navigator>
  )
}
