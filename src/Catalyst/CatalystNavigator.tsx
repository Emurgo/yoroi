import {createStackNavigator} from '@react-navigation/stack'
import React, {useState} from 'react'
import {useIntl} from 'react-intl'

import globalMessages from '../i18n/global-messages'
import {CatalystRoutes, defaultStackNavigationOptions} from '../navigation'
import {VotingRegTxData} from './hooks'
import {Step1} from './Step1'
import {Step2} from './Step2'
import {Step3} from './Step3'
import {Step4} from './Step4'
import {Step5} from './Step5'
import {Step6} from './Step6'

const Stack = createStackNavigator<CatalystRoutes>()
export const CatalystNavigator = () => {
  const strings = useStrings()
  const [pin, setPin] = useState('')
  const [votingRegTxData, setVotingRegTxData] = useState<VotingRegTxData | undefined>()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions,
        title: strings.title,
      }}
      initialRouteName="catalyst-landing"
    >
      <Stack.Screen name="catalyst-landing">{() => <Step1 setPin={setPin} />}</Stack.Screen>
      <Stack.Screen name="catalyst-generate-pin">{() => <Step2 pin={pin} />}</Stack.Screen>
      <Stack.Screen name="catalyst-confirm-pin">
        {() => <Step3 pin={pin} setVotingRegTxData={setVotingRegTxData} />}
      </Stack.Screen>
      <Stack.Screen name="catalyst-generate-trx">
        {() => <Step4 pin={pin} setVotingRegTxData={setVotingRegTxData} />}
      </Stack.Screen>
      <Stack.Screen name="catalyst-transaction">
        {() => {
          if (!votingRegTxData) throw new Error('invalid state')

          return <Step5 votingRegTxData={votingRegTxData} />
        }}
      </Stack.Screen>
      <Stack.Screen name="catalyst-qr-code" options={{...defaultStackNavigationOptions, headerLeft: () => null}}>
        {() => {
          if (!votingRegTxData) throw new Error('invalid state')

          return <Step6 votingRegTxData={votingRegTxData} />
        }}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(globalMessages.votingTitle),
  }
}
