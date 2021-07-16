// @flow

import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import {injectIntl} from 'react-intl'

import {CATALYST_ROUTES} from '../../RoutesList'
import globalMessages from '../../i18n/global-messages'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../navigationOptions'

import CatalystStep1 from './Step1'
import CatalystStep2 from './Step2'
import CatalystStep3 from './Step3'
import CatalystStep4 from './Step4'
import CatalystStep5 from './Step5'
import CatalystStep6 from './Step6'
import BiometricAuthScreen from '../Send/BiometricAuthScreen'

type CatalystNavigatorRoutes = {
  'catalyst-router': any,
  'catalyst-landing': any,
  'catalyst-generate-pin': any,
  'catalyst-confirm-pin': any,
  'catalyst-generate-trx': any,
  'catalyst-transaction': any,
  'catalyst-qr-code': any,
  'catalyst-biometrics-signing': any,
}

const Stack = createStackNavigator<any, CatalystNavigatorRoutes, any>()

const CatalystNavigator = injectIntl(({intl}) => (
  <Stack.Navigator
    screenOptions={{
      ...defaultStackNavigatorOptions,
      title: intl.formatMessage(globalMessages.votingTitle),
    }}
    initialRouteName={CATALYST_ROUTES.STEP1}
  >
    <Stack.Screen name={CATALYST_ROUTES.STEP1} component={CatalystStep1} options={defaultNavigationOptions} />
    <Stack.Screen name={CATALYST_ROUTES.STEP2} component={CatalystStep2} options={defaultNavigationOptions} />
    <Stack.Screen name={CATALYST_ROUTES.STEP3} component={CatalystStep3} options={defaultNavigationOptions} />
    <Stack.Screen name={CATALYST_ROUTES.STEP4} component={CatalystStep4} options={defaultNavigationOptions} />
    <Stack.Screen name={CATALYST_ROUTES.STEP5} component={CatalystStep5} options={defaultNavigationOptions} />
    <Stack.Screen name={CATALYST_ROUTES.STEP6} component={CatalystStep6} options={defaultNavigationOptions} />
    <Stack.Screen
      name={CATALYST_ROUTES.BIOMETRICS_SIGNING}
      component={BiometricAuthScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
))

export default CatalystNavigator
