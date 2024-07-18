import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {catalystManagerMaker, CatalystProvider} from '@yoroi/staking'
import {catalystApiMaker} from '@yoroi/staking/src'
import {useTheme} from '@yoroi/theme'
import cryptoRandomString from 'crypto-random-string'
import React, {useState} from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'

import {Boundary} from '../../components'
import globalMessages from '../../kernel/i18n/global-messages'
import {useMetrics} from '../../kernel/metrics/metricsManager'
import {
  defaultStackNavigationOptions,
  useWalletNavigation,
  VotingRegistrationRouteNavigation,
  VotingRegistrationRoutes,
} from '../../kernel/navigation'
import {ConfirmPin} from './useCases/ConfirmPin/ConfirmPin'
import {ConfirmVotingTx} from './useCases/ConfirmVotingTx/ConfirmVotingTx'
import {DisplayPin} from './useCases/DisplayPin/DisplayPin'
import {DownloadCatalyst} from './useCases/DownloadCatalyst/DownloadCatalyst'
import {QrCode} from './useCases/ShowQrCode/ShowQrCode'

const catalystApi = catalystApiMaker()
const catalystManager = catalystManagerMaker({
  api: catalystApi,
})

const Stack = createStackNavigator<VotingRegistrationRoutes>()
export const CatalystNavigator = () => {
  const {atoms, color} = useTheme()
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const {track} = useMetrics()
  const {styles} = useStyles()

  // NOTE: not part of navigator, should be moved into the catalyst provider
  const pin = usePin({length: 4, type: 'numeric'})
  const [votingKeyEncrypted, setVotingKeyEncrypted] = React.useState<string | undefined>(undefined)
  const [complete, setComplete] = React.useState(false)

  useFocusEffect(
    React.useCallback(() => {
      track.votingPageViewed()
    }, [track]),
  )

  const navigationOptions = React.useMemo(() => defaultStackNavigationOptions(atoms, color), [atoms, color])

  return (
    <CatalystProvider manager={catalystManager}>
      <Stack.Navigator
        screenOptions={{
          ...navigationOptions,
          title: strings.title,
        }}
      >
        {!complete ? (
          <Stack.Group>
            <Stack.Screen name="download-catalyst">
              {() => (
                <Boundary loading={{size: 'full'}}>
                  {/* STEP 1 */}
                  <DownloadCatalyst onNext={navigateTo.displayPin} />
                </Boundary>
              )}
            </Stack.Screen>

            <Stack.Screen name="display-pin">
              {/* STEP 2 */}
              {() => <DisplayPin onNext={navigateTo.confirmPin} pin={pin} />}
            </Stack.Screen>

            <Stack.Screen name="confirm-pin">
              {/* STEP 3 */}
              {() => <ConfirmPin onNext={navigateTo.confirmTx} pin={pin} />}
            </Stack.Screen>

            <Stack.Screen name="confirm-tx">
              {() => (
                <Boundary loading={{size: 'full', style: styles.loadingBackground}} error={{size: 'full'}}>
                  <ConfirmVotingTx
                    onNext={() => {
                      setComplete(true)
                      navigateTo.qrCode()
                    }}
                    pin={pin}
                    onSuccess={setVotingKeyEncrypted}
                  />
                </Boundary>
              )}
            </Stack.Screen>
          </Stack.Group>
        ) : (
          <Stack.Screen name="qr-code" options={{...navigationOptions, headerLeft: () => null}}>
            {() => {
              if (votingKeyEncrypted == null) throw new Error('invalid state')
              {
                /* STEP 4 */
              }
              return <QrCode onNext={navigateTo.txHistory} votingKeyEncrypted={votingKeyEncrypted} />
            }}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </CatalystProvider>
  )
}

const useNavigateTo = () => {
  const navigation = useNavigation<VotingRegistrationRouteNavigation>()
  const {resetToTxHistory} = useWalletNavigation()

  return {
    displayPin: () => navigation.navigate('display-pin'),
    confirmPin: () => navigation.navigate('confirm-pin'),
    confirmTx: () => navigation.navigate('confirm-tx'),
    qrCode: () => navigation.navigate('qr-code'),
    txHistory: () => resetToTxHistory(),
  }
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

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    loadingBackground: {
      backgroundColor: color.bg_color_high,
    },
  })

  return {styles}
}
