import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {TouchableOpacity} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useSelector} from 'react-redux'

import {Button} from '../../legacy/components/UiKit'
import {UI_V2} from '../../legacy/config/config'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../legacy/navigationOptions'
import {TX_HISTORY_ROUTES, WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {transactionsInfoSelector, walletMetaSelector} from '../../legacy/selectors'
import {COLORS} from '../../legacy/styles/config'
import {formatDateToSeconds} from '../../legacy/utils/format'
import iconGear from '../assets/img/icon/gear.png'
import {TxDetails} from './TxDetails'
import {TxHistory} from './TxHistory'

/* eslint-disable @typescript-eslint/no-explicit-any */
const Stack = createStackNavigator<{
  'tx-history-list': any
  'tx-details': any
}>()
/* eslint-enable @typescript-eslint/no-explicit-any */

export const TxHistoryNavigator = () => {
  const walletMeta = useSelector(walletMetaSelector)
  const transactionInfos = useSelector(transactionsInfoSelector)

  return (
    <Stack.Navigator screenOptions={defaultStackNavigatorOptions} initialRouteName={TX_HISTORY_ROUTES.MAIN}>
      <Stack.Screen name={TX_HISTORY_ROUTES.MAIN} component={TxHistory} options={headerBarOptions(walletMeta.name)} />

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

const headerBarOptions =
  (walletName: string) =>
  ({navigation}) => {
    const headerV1 = {
      headerStyle: {
        backgroundColor: COLORS.BACKGROUND_BLUE,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#fff',
      headerRight: () => (
        <Button
          onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)}
          iconImage={iconGear}
          title=""
          withoutBackground
        />
      ),
    }
    const headerV2 = {
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
    }

    const header = UI_V2 ? headerV2 : headerV1

    const headerOptions = {
      title: walletName,
      headerTitleStyle: {
        fontSize: 16,
        fontFamily: 'Rubik-Medium',
      },
      ...header,
    }

    return headerOptions
  }
