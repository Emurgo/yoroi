import {useNavigation} from '@react-navigation/native'
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack'
import {useRef} from 'react'

export type Routes = {
  'dapp-explorer-home': undefined
  'dapp-explorer-web-browser': undefined
}

export const NavigationStack = createStackNavigator<Routes>()

export const useNavigateTo = () => {
  const navigation = useNavigation<StackNavigationProp<Routes>>()
  const ref = useRef({
    home: () => navigation.navigate('dapp-explorer-home'),
    webBrowser: () => navigation.navigate('dapp-explorer-web-browser'),
  })
  return ref.current
}
