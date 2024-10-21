import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {catalystManagerMaker, CatalystProvider} from '@yoroi/staking'
import {catalystApiMaker} from '@yoroi/staking/src'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'

import {Boundary} from '../../components/Boundary/Boundary'
import globalMessages from '../../kernel/i18n/global-messages'
import {useMetrics} from '../../kernel/metrics/metricsManager'
import {
  defaultStackNavigationOptions,
  useWalletNavigation,
  VotingRegistrationRouteNavigation,
  VotingRegistrationRoutes,
} from '../../kernel/navigation'
import {NetworkTag} from '../Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {ConfirmPin} from './useCases/ConfirmPin/ConfirmPin'
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
