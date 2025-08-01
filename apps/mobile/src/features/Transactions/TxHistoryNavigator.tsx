import {createStackNavigator} from '@react-navigation/stack'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {
  defaultStackNavigationOptions,
  TxHistoryRoutes,
} from '~/kernel/navigation/navigation'
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
    <Stack.Navigator
      screenOptions={{
        ...navigationOptions,
        headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
      }}
    >
      <Stack.Screen
        name="history-list"
        options={{
          title: strings.historyTitle,
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
          title: strings.txDetailsTitle,
        }}
      >
        {() => (
          <Boundary loading={{size: 'full'}}>
            <TxDetails />
          </Boundary>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    historyTitle: intl.formatMessage(messages.historyTitle),
    txDetailsTitle: intl.formatMessage(messages.txDetailsTitle),
  }
}

const messages = defineMessages({
  historyTitle: {
    id: 'global.historyTitle',
    defaultMessage: '!!!History',
  },
  txDetailsTitle: {
    id: 'global.txDetailsTitle',
    defaultMessage: '!!!Transaction Details',
  },
})
