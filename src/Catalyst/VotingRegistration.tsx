import {useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import cryptoRandomString from 'crypto-random-string'
import React, {useState} from 'react'
import {useIntl} from 'react-intl'

import {Boundary, ErrorModal} from '../components'
import {useVotingRegTx} from '../hooks'
import globalMessages, {errorMessages} from '../i18n/global-messages'
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
  const [pin] = useState(() => cryptoRandomString({length: 4, type: 'numeric'}))
  const wallet = useSelectedWallet()
  const {votingRegTx, votingKeyEncrypted, error} = useVotingRegTx(wallet)

  const navigation = useNavigation<VotingRegistrationRouteNavigation>()
  const {resetToTxHistory} = useWalletNavigation()

  const [displayErrorModal, setDisplayErrorModal] = useState(false)

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          ...defaultStackNavigationOptions,
          title: strings.title,
        }}
        initialRouteName="download-catalyst"
      >
        <Stack.Screen name="download-catalyst">
          {() => (
            <Boundary>
              <DownloadCatalyst onNext={() => navigation.navigate('display-pin')} />
            </Boundary>
          )}
        </Stack.Screen>

        <Stack.Screen name="display-pin">
          {() => <DisplayPin pin={pin} onNext={() => navigation.navigate('confirm-pin')} />}
        </Stack.Screen>

        <Stack.Screen name="confirm-pin">
          {() => <ConfirmPin pin={pin} onNext={() => navigation.navigate('confirm-tx')} />}
        </Stack.Screen>

        <Stack.Screen name="confirm-tx">
          {() => {
            if (votingRegTx == null) throw new Error('invalid state')
            return <ConfirmVotingTx votingRegTx={votingRegTx} onNext={() => navigation.navigate('qr-code')} />
          }}
        </Stack.Screen>

        <Stack.Screen name="qr-code" options={{...defaultStackNavigationOptions, headerLeft: () => null}}>
          {() => {
            if (votingKeyEncrypted == null) throw new Error('invalid state')
            return <QrCode catalystSKHexEncrypted={votingKeyEncrypted} onNext={() => resetToTxHistory()} />
          }}
        </Stack.Screen>
      </Stack.Navigator>

      {error && (
        <ErrorModal
          visible={displayErrorModal}
          title={strings.errorTitle}
          errorMessage={strings.errorMessage}
          errorLogs={error.message}
          onRequestClose={() => setDisplayErrorModal(false)}
        />
      )}
    </>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(globalMessages.votingTitle),
    errorTitle: intl.formatMessage(errorMessages.generalTxError.title),
    errorMessage: intl.formatMessage(errorMessages.generalTxError.message),
  }
}
