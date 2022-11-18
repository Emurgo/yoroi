import {useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import cryptoRandomString from 'crypto-random-string'
import React, {useState} from 'react'
import {useIntl} from 'react-intl'

import {Boundary} from '../components'
import {usePrefetchVotingRegTx} from '../hooks'
import globalMessages from '../i18n/global-messages'
import {
  defaultStackNavigationOptions,
  useWalletNavigation,
  VotingRegistrationRouteNavigation,
  VotingRegistrationRoutes,
} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'
import {ConfirmPin} from './ConfirmPin'
import {ConfirmVotingTx} from './ConfirmVotingTx'
import {DisplayPin} from './DisplayPin'
import {DownloadCatalyst} from './DownloadCatalyst'
import {QrCode} from './QrCode'

const Stack = createStackNavigator<VotingRegistrationRoutes>()
export const VotingRegistration = () => {
  const strings = useStrings()
  const navigation = useNavigation<VotingRegistrationRouteNavigation>()
  const {resetToTxHistory} = useWalletNavigation()
  const wallet = useSelectedWallet()
  const prefetchVotingRegTx = usePrefetchVotingRegTx(wallet)

  const pin = usePin({length: 4, type: 'numeric'})

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions,
        title: strings.title,
        detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
      }}
    >
      <Stack.Screen name="download-catalyst">
        {() => (
          <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>
            <DownloadCatalyst onNext={() => navigation.navigate('display-pin')} />
          </Boundary>
        )}
      </Stack.Screen>

      <Stack.Screen name="display-pin">
        {() => <DisplayPin pin={pin} onNext={() => navigation.navigate('confirm-pin')} />}
      </Stack.Screen>

      <Stack.Screen name="confirm-pin">
        {() => (
          <ConfirmPin
            pin={pin}
            onNext={() => {
              prefetchVotingRegTx()
              navigation.navigate('confirm-tx')
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="confirm-tx">
        {() => (
          <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>
            <ConfirmVotingTx onNext={() => navigation.navigate('qr-code')} />
          </Boundary>
        )}
      </Stack.Screen>

      <Stack.Screen name="qr-code" options={{...defaultStackNavigationOptions, headerLeft: () => null}}>
        {() => (
          <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>
            <QrCode onNext={() => resetToTxHistory()} />
          </Boundary>
        )}
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

const usePin = (options: cryptoRandomString.Options) => {
  const [pin] = useState(() => cryptoRandomString(options))
  return pin
}
