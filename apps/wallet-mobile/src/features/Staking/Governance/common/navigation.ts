import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack'
import {useRef} from 'react'
import {useNavigation} from '@react-navigation/native'

type Routes = {
  home: undefined
  'change-vote': undefined
  'confirm-tx': undefined
  'tx-success': undefined
  'tx-failed': undefined
}

export const NavigationStack = createStackNavigator<Routes>()

export const useNavigateTo = () => {
  const navigation = useNavigation<StackNavigationProp<Routes>>()
  return useRef({
    home: () => navigation.navigate('home'),
    changeVote: () => navigation.navigate('change-vote'),
    confirmTx: () => navigation.navigate('confirm-tx'),
    txSuccess: () => navigation.navigate('tx-success'),
    txFailed: () => navigation.navigate('tx-failed'),
  }).current
}
