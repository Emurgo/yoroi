import {atoms as a, useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'

import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {InititalizationRoutes} from '~/kernel/navigation/types'
import {AnalyticsChangedScreen} from '../screens/AnalyticsChangedScreen'
import {ReadPrivacyPolicyScreen} from '../screens/ReadPrivacyPolicyScreen'
import {ReadTermsOfServiceScreen} from '../screens/ReadTermsOfServiceScreen'
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
        component={TermsOfServiceChangedScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="analytics-changed"
        component={AnalyticsChangedScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="read-terms-of-service"
        component={ReadTermsOfServiceScreen}
        options={{
          headerShown: true,
          title: strings.initialization.acceptTermsTitle,
        }}
      />

      <Stack.Screen
        name="read-privacy-policy"
        component={ReadPrivacyPolicyScreen}
        options={{
          headerShown: true,
          title: strings.initialization.acceptPrivacyPolicyTitle,
        }}
      />
    </Stack.Navigator>
  )
}
