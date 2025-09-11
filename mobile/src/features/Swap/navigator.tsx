import {useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {FailedTxScreen as SwapFailedTxScreen} from '~/features/ReviewTx/useCases/ShowFailedTxScreen/FailedTxScreen'
import {SubmittedTxScreen as SwapSubmittedTxScreen} from '~/features/ReviewTx/useCases/ShowSubmittedTxScreen/SubmittedTxScreen'
import {NetworkTag} from '~/features/Settings/ui/screens/ChangeApplicationSettingsScreen/ChangeNetwork/NetworkTag'
import {SelectProtocolScreen} from '~/features/Swap/useCases/CreateOrder/SelectProtocolScreen'
import {SelectTokenScreen} from '~/features/Swap/useCases/CreateOrder/SelectTokenScreen'
import {ListOrders} from '~/features/Swap/useCases/ListOrders/ListOrders'
import {ReviewSwap} from '~/features/Swap/useCases/ReviewSwap/ReviewSwap'
import {ShowPreprodNoticeScreen} from '~/features/Swap/useCases/ShowPreprodNoticeScreen/ShowPreprodNoticeScreen'
import {SwapSettings} from '~/features/Swap/useCases/SwapSettings/SwapSettings'
import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {SwapTokenRoutes} from '~/kernel/navigation/types'

import {HeaderRightSwap} from '../Transactions/common/HeaderRightSwap'
import {SwapMainScreen} from './useCases/CreateOrder/SwapMainScreen'

const Stack = createStackNavigator<SwapTokenRoutes>()

export const SwapNavigator = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const navigationOptions = React.useMemo(
    () => defaultStackNavigationOptions(p),
    [p],
  )

  return (
    <Stack.Navigator
      screenOptions={{
        ...navigationOptions,
        headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
      }}
    >
      <Stack.Screen
        name="main"
        options={{
          title: strings.swap.swapTitle,
          headerRight: () => <HeaderRightSwap />,
        }}
        getComponent={() => SwapMainScreen}
      />

      <Stack.Screen
        name="orders"
        options={{
          title: strings.swap.listOrdersSheetTitle,
        }}
        getComponent={() => ListOrders}
      />

      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
        getComponent={() => SwapSettings}
      />

      <Stack.Screen
        name="review"
        options={{
          title: strings.swap.swapDetailsTitle,
        }}
        getComponent={() => ReviewSwap}
      />

      <Stack.Screen
        name="select-token"
        options={{
          title: strings.swap.selectToken,
        }}
        getComponent={() => SelectTokenScreen}
      />

      <Stack.Screen
        name="select-protocol"
        options={{
          title: strings.swap.changePool,
        }}
        getComponent={() => SelectProtocolScreen}
      />

      <Stack.Screen
        name="preprod-notice"
        options={{
          title: strings.swap.swapTitle,
        }}
        getComponent={() => ShowPreprodNoticeScreen}
      />

      <Stack.Screen
        name="submitted-tx"
        options={{
          headerShown: false,
        }}
        getComponent={() => SwapSubmittedTxScreen}
      />

      <Stack.Screen
        name="failed-tx"
        options={{
          headerShown: false,
        }}
        getComponent={() => SwapFailedTxScreen}
      />
    </Stack.Navigator>
  )
}
