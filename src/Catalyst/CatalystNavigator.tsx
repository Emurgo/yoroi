import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {useIntl} from 'react-intl'

import globalMessages from '../../legacy/i18n/global-messages'
import {CatalystRoutes, defaultStackNavigationOptions} from '../navigation'
import {Step1} from './Step1'
import {Step2} from './Step2'
import {Step3} from './Step3'
import {Step4} from './Step4'
import {Step5} from './Step5'
import {Step6} from './Step6'

const Stack = createStackNavigator<CatalystRoutes>()
export const CatalystNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions,
        title: strings.title,
      }}
      initialRouteName="catalyst-landing"
    >
      <Stack.Screen name="catalyst-landing" component={Step1} />
      <Stack.Screen name="catalyst-generate-pin" component={Step2} />
      <Stack.Screen name="catalyst-confirm-pin" component={Step3} />
      <Stack.Screen name="catalyst-generate-trx" component={Step4} />
      <Stack.Screen name="catalyst-transaction" component={Step5} />
      <Stack.Screen
        name="catalyst-qr-code"
        component={Step6}
        options={{...defaultStackNavigationOptions, headerLeft: () => null}}
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
