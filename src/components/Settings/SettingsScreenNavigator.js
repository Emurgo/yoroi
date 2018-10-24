// @flow

import {createStackNavigator} from 'react-navigation'
import SettingsScreen from './SettingsScreen'
import ChangeWalletName from './ChangeWalletName'
import SupportScreen from './SupportScreen'

import {SETTINGS_ROUTES} from '../../RoutesList'

const SettingsScreenNavigator = createStackNavigator({
  [SETTINGS_ROUTES.MAIN]: SettingsScreen,
  [SETTINGS_ROUTES.SUPPORT]: SupportScreen,
  [SETTINGS_ROUTES.CHANGE_WALLET_NAME]: ChangeWalletName,
}, {
  initialRouteName: SETTINGS_ROUTES.MAIN,
  navigationOptions: ({navigation}) => ({
    title: navigation.getParam('title'),
  }),
})

export default SettingsScreenNavigator
