import {createStackNavigator} from '@react-navigation/stack'

export type Routes = {
  'dapp-explorer-home': undefined
}

export const NavigationStack = createStackNavigator<Routes>()
