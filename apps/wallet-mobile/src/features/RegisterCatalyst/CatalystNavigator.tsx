import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {catalystManagerMaker, CatalystProvider} from '@yoroi/staking'
import {catalystApiMaker} from '@yoroi/staking/src'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'

import {Boundary} from '../../components/Boundary/Boundary'
import {NetworkTag} from '../../features/Settings/ChangeNetwork/NetworkTag'
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
import {DownloadCatalystAppScreen} from './useCases/DownloadCatalystAppScreen/DownloadCatalystAppScreen'
import {QrCode} from './useCases/ShowQrCode/ShowQrCode'

const catalystApi = catalystApiMaker()
const catalystManager = catalystManagerMaker({
  api: catalystApi,
})

const Stack = createStackNavigator<VotingRegistrationRoutes>()
export const CatalystNavigator = () => {
  const {atoms, color} = useTheme()
  const strings = useStrings()
  const {track} = useMetrics()
  const {styles} = useStyles()

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
          headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
        }}
      >
        <Stack.Group>
          {/* STEP 1 */}
          <Stack.Screen name="download-catalyst">
            {() => (
              <Boundary loading={{size: 'full'}}>
                <DownloadCatalystAppScreen />
              </Boundary>
            )}
          </Stack.Screen>

          {/* STEP 2 */}
          <Stack.Screen name="display-pin" component={DisplayPin} />

          {/* STEP 3 */}
          <Stack.Screen name="confirm-pin" component={ConfirmPin} />

          <Stack.Screen name="confirm-tx">
            {() => (
              <Boundary loading={{size: 'full', style: styles.loadingBackground}} error={{size: 'full'}}>
                <ConfirmVotingTx />
              </Boundary>
            )}
          </Stack.Screen>

          {/* STEP 4 */}
          <Stack.Screen component={QrCode} name="qr-code" options={{...navigationOptions, headerLeft: () => null}} />
        </Stack.Group>
      </Stack.Navigator>
    </CatalystProvider>
  )
}

export const useNavigateTo = () => {
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

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    loadingBackground: {
      backgroundColor: color.bg_color_max,
    },
  })

  return {styles}
}
