import {useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {InititalizationRoutes} from '~/kernel/navigation/types'

import {ReadPrivacyPolicyScreen} from '../../../Legal/ui/screens/ReadPrivacyPolicyScreen'
import {ReadTermsOfServiceScreen} from '../../../Legal/ui/screens/ReadTermsOfServiceScreen'
import {AnalyticsChangedScreen} from '../screens/AnalyticsChangedScreen'
import {TermsOfServiceChangedScreen} from '../screens/TermsOfServiceChangedScreen'

const Stack = createStackNavigator<InititalizationRoutes>()

export const AgreementChangedNavigator = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  return (
    <Stack.Navigator
      initialRouteName="terms-of-service-changed"
      screenOptions={{
        ...defaultStackNavigationOptions(p),
      }}
    >
      <Stack.Screen
        name="terms-of-service-changed"
        getComponent={() => TermsOfServiceChangedScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="analytics-changed"
        getComponent={() => AnalyticsChangedScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="read-terms-of-service"
        getComponent={() => ReadTermsOfServiceScreen}
        options={{
          headerShown: true,
          title: strings.initialization.acceptTermsTitle,
        }}
      />

      <Stack.Screen
        name="read-privacy-policy"
        getComponent={() => ReadPrivacyPolicyScreen}
        options={{
          headerShown: true,
          title: strings.initialization.acceptPrivacyPolicyTitle,
        }}
      />
    </Stack.Navigator>
  )
}
