import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {TouchableOpacity} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useSelector} from 'react-redux'

import {TxDetails} from '../../legacy/components/TxHistory/TxDetails'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../legacy/navigationOptions'
import {TX_HISTORY_ROUTES, WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {transactionsInfoSelector, walletMetaSelector} from '../../legacy/selectors'
import {COLORS} from '../../legacy/styles/config'
import {formatDateToSeconds} from '../../legacy/utils/format'
import {TxHistory} from './TxHistory'

type TxHistoryRoutes = {
  'tx-history-list': any // eslint-disable-line @typescript-eslint/no-explicit-any
  'tx-details': any // eslint-disable-line @typescript-eslint/no-explicit-any
}

const Stack = createStackNavigator<TxHistoryRoutes>()

const headerBar =
  (walletName: string) =>
  ({navigation}) => ({
    title: walletName,
    headerStyle: {
      backgroundColor: COLORS.BACKGROUND_GRAY,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerTitleStyle: {
      fontSize: 16,
      fontFamily: 'Rubik-Medium',
    },
    headerTintColor: COLORS.ERROR_TEXT_COLOR_DARK,
    headerRight: () => (
      <TouchableOpacity onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)}>
        <Icon name="dots-vertical" size={30} color="#8A92A3" />
      </TouchableOpacity>
    ),
  })

export const TxHistoryNavigator = () => {
  const walletMeta = useSelector(walletMetaSelector)
  const transactionInfos = useSelector(transactionsInfoSelector)

  return (
    <Stack.Navigator screenOptions={{...defaultStackNavigatorOptions}} initialRouteName={TX_HISTORY_ROUTES.MAIN}>
      <Stack.Screen name={TX_HISTORY_ROUTES.MAIN} component={TxHistory} options={headerBar(walletMeta.name)} />
      <Stack.Screen
        name={TX_HISTORY_ROUTES.TX_DETAIL}
        component={TxDetails}
        options={({route}) => ({
          title: formatDateToSeconds(transactionInfos[route.params?.id].submittedAt),
          ...defaultNavigationOptions,
        })}
      />
    </Stack.Navigator>
  )
}
