// @flow
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import {useSelector} from 'react-redux'

import {Button} from '../UiKit'
import TxHistory from './TxHistory'
import TxDetails from './TxDetails'
import {TX_HISTORY_ROUTES, WALLET_ROOT_ROUTES} from '../../RoutesList'
import iconGear from '../../assets/img/gear.png'
import {walletMetaSelector, transactionsInfoSelector} from '../../selectors'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'
import {formatDateToSeconds} from '../../utils/format'

import styles from './styles/SettingsButton.style'

type TxHistoryRoutes = {
  'tx-history-list': any,
  'tx-details': any,
}

const Stack = createStackNavigator<any, TxHistoryRoutes, any>()

const TxHistoryNavigator = () => {
  const walletMeta = useSelector(walletMetaSelector)
  const transactionInfos = useSelector(transactionsInfoSelector)

  return (
    <Stack.Navigator
      screenOptions={{...defaultStackNavigatorOptions}}
      initialRouteName={TX_HISTORY_ROUTES.MAIN}
    >
      <Stack.Screen
        name={TX_HISTORY_ROUTES.MAIN}
        component={TxHistory}
        options={({navigation}) => ({
          title: walletMeta.name,
          headerRight: () => (
            <Button
              style={styles.settingsButton}
              onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)}
              iconImage={iconGear}
              title=""
              withoutBackground
            />
          ),
          ...defaultNavigationOptions,
        })}
      />
      <Stack.Screen
        name={TX_HISTORY_ROUTES.TX_DETAIL}
        component={TxDetails}
        options={({route}) => ({
          title: formatDateToSeconds(
            transactionInfos[(route.params?.id)].submittedAt,
          ),
          ...defaultNavigationOptions,
        })}
      />
    </Stack.Navigator>
  )
}

export default TxHistoryNavigator
