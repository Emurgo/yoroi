// @flow

import {createStackNavigator} from 'react-navigation'
import SettingsScreen from './SettingsScreen'
import ChangeWalletName from './ChangeWalletName'
import SupportScreen from './SupportScreen'
import TermsOfServiceScreen from './TermsOfServiceScreen'

import {SETTINGS_ROUTES} from '../../RoutesList'

const SettingsScreenNavigator = createStackNavigator(
  {
    [SETTINGS_ROUTES.MAIN]: SettingsScreen,
    [SETTINGS_ROUTES.CHANGE_WALLET_NAME]: ChangeWalletName,
    [SETTINGS_ROUTES.TERMS_OF_USE]: TermsOfServiceScreen,
    [SETTINGS_ROUTES.SUPPORT]: SupportScreen,
  },
  {
    initialRouteName: SETTINGS_ROUTES.MAIN,
    navigationOptions: ({navigation}) => ({
      title: navigation.getParam('title'),
    }),
  },
)

export default SettingsScreenNavigator
