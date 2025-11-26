import {useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {ConfirmPin} from '~/features/RegisterCatalyst/useCases/ConfirmPin/ConfirmPin'
import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {VotingRegistrationRoutes} from '~/kernel/navigation/types'
import {Boundary} from '~/ui/Boundary/Boundary'

import {NetworkTag} from '../Settings/ui/shared/NetworkTag'
import {DisplayPin} from './useCases/DisplayPin/DisplayPin'
import {DownloadCatalystAppScreen} from './useCases/DownloadCatalystAppScreen/DownloadCatalystAppScreen'
import {QrCode} from './useCases/ShowQrCode/ShowQrCode'

const Stack = createStackNavigator<VotingRegistrationRoutes>()
export const CatalystNavigator = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  const navigationOptions = React.useMemo(
    () => defaultStackNavigationOptions(p),
    [p],
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
