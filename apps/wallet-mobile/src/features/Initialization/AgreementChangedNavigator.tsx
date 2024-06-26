import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'

import {defaultStackNavigationOptions, InititalizationRoutes} from '../../kernel/navigation'
import {AnalyticsChangedScreen} from './AnalyticsChangedScreen'
import {useStrings} from './common'
import {ReadPrivacyPolicyScreen} from './ReadPrivacyPolicyScreen'
import {ReadTermsOfServiceScreen} from './ReadTermsOfServiceScreen'
import {TermsOfServiceChangedScreen} from './TermsOfServiceChangedScreen'

const Stack = createStackNavigator<InititalizationRoutes>()

export const AgreementChangedNavigator = () => {
  const {atoms, color, isDark} = useTheme()
  const strings = useStrings()
  return (
    <Stack.Navigator
      initialRouteName="terms-of-service-changed"
      screenOptions={{
        ...defaultStackNavigationOptions(atoms, color, isDark),
      }}
    >
      <Stack.Screen
        name="terms-of-service-changed"
        component={TermsOfServiceChangedScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen name="analytics-changed" component={AnalyticsChangedScreen} options={{headerShown: false}} />

      <Stack.Screen
        name="read-terms-of-service"
        component={ReadTermsOfServiceScreen}
        options={{headerShown: true, title: strings.acceptTermsTitle}}
      />

      <Stack.Screen
        name="read-privacy-policy"
        component={ReadPrivacyPolicyScreen}
        options={{headerShown: true, title: strings.acceptPrivacyPolicyTitle}}
      />
    </Stack.Navigator>
  )
}
