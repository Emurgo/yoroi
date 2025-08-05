import {createStackNavigator} from '@react-navigation/stack'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'

import {ReceiveProvider} from '~/features/Receive/common/ReceiveProvider'
import {DescribeSelectedAddressScreen} from '~/features/Receive/useCases/DescribeSelectedAddressScreen'
import {ListMultipleAddressesScreen} from '~/features/Receive/useCases/ListMultipleAddressesScreen'
import {RequestSpecificAmountScreen} from '~/features/Receive/useCases/RequestSpecificAmountScreen'
import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {TxHistoryRoutes} from '~/kernel/navigation/types'
import {Boundary} from '~/ui/Boundary/Boundary'
import {HeaderRightHistory} from './common/HeaderRightHistory'
import {TxDetails} from './useCases/TxDetails/TxDetails'
import {TxHistory} from './useCases/TxHistory/TxHistory'

const Stack = createStackNavigator<TxHistoryRoutes>()

export const TxHistoryNavigator = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const navigationOptions = React.useMemo(
    () => defaultStackNavigationOptions(a, p),
    [p],
  )

  return (
    <ReceiveProvider>
      <Stack.Navigator
        screenOptions={{
          ...navigationOptions,
          headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
        }}
      >
        <Stack.Screen
          name="history-list"
          options={{
            title: strings.transactions.history.historyTitle,
            headerRight: () => <HeaderRightHistory />,
          }}
        >
          {() => (
            <Boundary loading={{size: 'full'}}>
              <TxHistory />
            </Boundary>
          )}
        </Stack.Screen>

        <Stack.Screen
          name="tx-details"
          options={{
            title: strings.transactions.history.txDetailsTitle,
          }}
        >
          {() => (
            <Boundary loading={{size: 'full'}}>
              <TxDetails />
            </Boundary>
          )}
        </Stack.Screen>

        <Stack.Screen
          name="receive-single"
          options={{
            title: strings.receive.receiveTitle,
          }}
        >
          {() => (
            <Boundary loading={{size: 'full'}}>
              <DescribeSelectedAddressScreen />
            </Boundary>
          )}
        </Stack.Screen>

        <Stack.Screen
          name="receive-multiple"
          options={{
            title: strings.receive.multipleAddress,
          }}
        >
          {() => (
            <Boundary loading={{size: 'full'}}>
              <ListMultipleAddressesScreen />
            </Boundary>
          )}
        </Stack.Screen>

        <Stack.Screen
          name="receive-specific-amount"
          options={{
            title: strings.receive.specificAmount,
          }}
        >
          {() => (
            <Boundary loading={{size: 'full'}}>
              <RequestSpecificAmountScreen />
            </Boundary>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </ReceiveProvider>
  )
}
