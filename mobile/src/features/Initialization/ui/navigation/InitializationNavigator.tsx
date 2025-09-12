import {useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {InitiatePinScreen} from '~/features/Auth/ui/screens/InitiatePinScreen'
import {SelectLanguageScreen} from '~/features/Settings/ui/screens/ChangeApplicationSettingsScreen/SelectLanguageScreen/SelectLanguageScreen'
import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {InititalizationRoutes} from '~/kernel/navigation/types'

import {AnalyticsNoticeScreen} from '../screens/AnalyticsNoticeScreen'
import {InitialScreen} from '../screens/InitialScreen'
import {ReadPrivacyPolicyScreen} from '../screens/ReadPrivacyPolicyScreen'
import {ReadTermsOfServiceScreen} from '../screens/ReadTermsOfServiceScreen'

const Stack = createStackNavigator<InititalizationRoutes>()
export const InitializationNavigator = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions(p),
      }}
    >
      <Stack.Screen
        name="initial"
        getComponent={() => InitialScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen //
        name="language-pick"
        options={{title: strings.initialization.languagePickerTitle}}
        getComponent={() => SelectLanguageScreen}
      />

      <Stack.Screen
        name="read-terms-of-service"
        getComponent={() => ReadTermsOfServiceScreen}
        options={{title: strings.initialization.acceptTermsTitle}}
      />

      <Stack.Screen
        name="read-privacy-policy"
        getComponent={() => ReadPrivacyPolicyScreen}
        options={{title: strings.initialization.acceptPrivacyPolicyTitle}}
      />

      <Stack.Screen //
        name="enable-login-with-pin"
        options={{headerShown: false}}
        getComponent={() => InitiatePinScreen}
      />

      <Stack.Screen //
        name="analytics"
        options={{headerShown: false}}
        getComponent={() => AnalyticsNoticeScreen}
      />
    </Stack.Navigator>
  )
}
