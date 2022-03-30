import {createStackNavigator} from '@react-navigation/stack'
import React, {useState} from 'react'
import {useIntl} from 'react-intl'

import globalMessages from '../../legacy/i18n/global-messages'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../legacy/navigationOptions'
import {CATALYST_ROUTES} from '../../legacy/RoutesList'
import {BiometricAuthScreen} from '../BiometricAuth'
import {VotingRegTxData} from './hooks'
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
  const [pin, setPin] = useState('')
  const [votingRegTxData, setVotingRegTxData] = useState<VotingRegTxData | undefined>()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigatorOptions,
        title: strings.title,
      }}
      initialRouteName={CATALYST_ROUTES.STEP1}
    >
      <Stack.Screen name={CATALYST_ROUTES.STEP1} options={defaultNavigationOptions}>
        {() => <Step1 setPin={setPin} />}
      </Stack.Screen>
      <Stack.Screen name={CATALYST_ROUTES.STEP2} options={defaultNavigationOptions}>
        {() => <Step2 pin={pin} />}
      </Stack.Screen>
      <Stack.Screen name={CATALYST_ROUTES.STEP3} options={defaultNavigationOptions}>
        {() => <Step3 pin={pin} setVotingRegTxData={setVotingRegTxData} />}
      </Stack.Screen>
      <Stack.Screen name={CATALYST_ROUTES.STEP4} options={defaultNavigationOptions}>
        {() => <Step4 pin={pin} setVotingRegTxData={setVotingRegTxData} />}
      </Stack.Screen>
      <Stack.Screen name={CATALYST_ROUTES.STEP5} options={defaultNavigationOptions}>
        {() => {
          if (!votingRegTxData) throw new Error('invalid state')

          return <Step5 votingRegTxData={votingRegTxData} />
        }}
      </Stack.Screen>
      <Stack.Screen name={CATALYST_ROUTES.STEP6} options={defaultNavigationOptions}>
        {() => <Step6 votingRegTxData={votingRegTxData} />}
      </Stack.Screen>
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
