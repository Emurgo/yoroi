import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {useIntl} from 'react-intl'

import globalMessages from '../../legacy/i18n/global-messages'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../legacy/navigationOptions'
import {CATALYST_ROUTES} from '../../legacy/RoutesList'
import {BiometricAuthScreen} from '../BiometricAuth'
import {Step1} from './Step1'
import {Step2} from './Step2'
import {Step3} from './Step3'
import {Step4} from './Step4'
import {Step5} from './Step5'
import {Step6} from './Step6'

/* eslint-disable @typescript-eslint/no-explicit-any */
type CatalystNavigatorRoutes = {
  'catalyst-router': any
  'catalyst-landing': any
  'catalyst-generate-pin': any
  'catalyst-confirm-pin': any
  'catalyst-generate-trx': any
  'catalyst-transaction': any
  'catalyst-qr-code': any
  'catalyst-biometrics-signing': any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const Stack = createStackNavigator<CatalystNavigatorRoutes>()

export const CatalystNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigatorOptions,
        title: strings.title,
      }}
      initialRouteName={CATALYST_ROUTES.STEP1}
    >
      <Stack.Screen name={CATALYST_ROUTES.STEP1} component={Step1} options={defaultNavigationOptions} />
      <Stack.Screen name={CATALYST_ROUTES.STEP2} component={Step2} options={defaultNavigationOptions} />
      <Stack.Screen name={CATALYST_ROUTES.STEP3} component={Step3} options={defaultNavigationOptions} />
      <Stack.Screen name={CATALYST_ROUTES.STEP4} component={Step4} options={defaultNavigationOptions} />
      <Stack.Screen name={CATALYST_ROUTES.STEP5} component={Step5} options={defaultNavigationOptions} />
      <Stack.Screen name={CATALYST_ROUTES.STEP6} component={Step6} options={defaultNavigationOptions} />
      <Stack.Screen
        name={CATALYST_ROUTES.BIOMETRICS_SIGNING}
        component={BiometricAuthScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(globalMessages.votingTitle),
  }
}
