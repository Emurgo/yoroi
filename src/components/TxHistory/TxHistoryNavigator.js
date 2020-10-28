// @flow
import React from 'react'
import {Button} from '../UiKit'
import {createStackNavigator} from '@react-navigation/stack'
import TxHistory from './TxHistory'
import TxDetails from './TxDetails'
import {TX_HISTORY_ROUTES, WALLET_ROUTES} from '../../RoutesList'
import SettingsScreenNavigator from '../Settings/SettingsScreenNavigator'
import iconGear from '../../assets/img/gear.png'

import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'

import styles from './styles/SettingsButton.style'

const _TxHistoryNavigator = createStackNavigator(
  {
    [TX_HISTORY_ROUTES.MAIN]: {
      screen: TxHistory,
      navigationOptions: ({navigation}) => ({
        title: navigation.getParam('title'),
        headerRight: (
          <Button
            style={styles.settingsButton}
            onPress={() => navigation.navigate(WALLET_ROUTES.SETTINGS)}
            iconImage={iconGear}
            title=""
            withoutBackground
          />
        ),
        ...defaultNavigationOptions,
      }),
    },
    [TX_HISTORY_ROUTES.TX_DETAIL]: {
      screen: TxDetails,
      navigationOptions: ({navigation}) => ({
        title: navigation.getParam('title'),
        ...defaultNavigationOptions,
      }),
    },
    [WALLET_ROUTES.SETTINGS]: {
      screen: SettingsScreenNavigator,
      navigationOptions: {
        header: null,
        ...defaultNavigationOptions,
      },
    },
  },
  {
    initialRouteName: TX_HISTORY_ROUTES.MAIN,
    ...defaultStackNavigatorOptions,
  },
)

const Stack = createStackNavigator()

// TODO
const TxHistoryNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name={TX_HISTORY_ROUTES.MAIN} component={TxHistory} />
  </Stack.Navigator>
)

export default TxHistoryNavigator
