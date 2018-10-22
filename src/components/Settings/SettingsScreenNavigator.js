// @flow

import {createStackNavigator} from 'react-navigation'
import SettingsScreen from './SettingsScreen'
import SupportScreen from './SupportScreen'
import {SETTINGS_ROUTES} from '../../RoutesList'

const SettingsScreenNavigator = createStackNavigator({
  [SETTINGS_ROUTES.MAIN]: SettingsScreen,
  [SETTINGS_ROUTES.SUPPORT]: SupportScreen,
}, {
  initialRouteName: SETTINGS_ROUTES.MAIN,
  navigationOptions: ({navigation}) => ({
    title: 'i18nSettings',
  }),
})

export default SettingsScreenNavigator
