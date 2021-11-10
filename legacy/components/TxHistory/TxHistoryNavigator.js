// @flow

import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {TouchableOpacity} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useSelector} from 'react-redux'

// $FlowFixMe
import TxHistory from '../../../src/TxHistory/TxHistory'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../navigationOptions'
import {TX_HISTORY_ROUTES, WALLET_ROOT_ROUTES} from '../../RoutesList'
import {transactionsInfoSelector, walletMetaSelector} from '../../selectors'
import {COLORS} from '../../styles/config'
import {formatDateToSeconds} from '../../utils/format'
import TxDetails from './TxDetails'

type TxHistoryRoutes = {
  'tx-history-list': any,
  'tx-details': any,
}

const Stack = createStackNavigator<any, TxHistoryRoutes, any>()

const headerBar =
  (walletName: string) =>
  ({navigation}) => ({
    title: walletName,
    headerStyle: {
      backgroundColor: COLORS.BACKGROUND_GRAY,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerTintColor: COLORS.ERROR_TEXT_COLOR_DARK,
    headerRight: () => (
      <TouchableOpacity onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)}>
        <Icon name="dots-vertical" size={30} color="#8A92A3" />
      </TouchableOpacity>
    ),
  })

const TxHistoryNavigator = () => {
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

export default TxHistoryNavigator
