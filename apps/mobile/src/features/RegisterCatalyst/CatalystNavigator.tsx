import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {useWalletNavigation} from '~/kernel/navigation/hooks'
import {VotingRegistrationRouteNavigation, VotingRegistrationRoutes} from '~/kernel/navigation/types'
import {Boundary} from '~/ui/Boundary/Boundary'
import {NetworkTag} from '../Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {ConfirmPin} from './useCases/ConfirmPin/ConfirmPin'
import {DisplayPin} from './useCases/DisplayPin/DisplayPin'
import {DownloadCatalystAppScreen} from './useCases/DownloadCatalystAppScreen/DownloadCatalystAppScreen'
import {QrCode} from './useCases/ShowQrCode/ShowQrCode'

const Stack = createStackNavigator<VotingRegistrationRoutes>()
export const CatalystNavigator = () => {
  const {atoms, palette: p} = useTheme()
  const strings = useStrings()
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.votingPageViewed()
    }, [track]),
  )

  const navigationOptions = React.useMemo(
    () => defaultStackNavigationOptions(atoms, p),
    [atoms, p],
  )

  return (
    <Stack.Navigator
      screenOptions={{
        ...navigationOptions,
        title: strings.global.votingTitle,
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
        <Stack.Screen
          component={QrCode}
          name="qr-code"
          options={{...navigationOptions, headerLeft: () => null}}
        />
      </Stack.Group>
    </Stack.Navigator>
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
