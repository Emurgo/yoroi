import {useNavigation} from '@react-navigation/native'
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack'
import {useRef} from 'react'

export type Routes = {
  'staking-gov-home': undefined
  'staking-gov-change-vote': undefined
  'staking-gov-not-supported-version': undefined
  'staking-gov-no-funds': undefined
  'staking-gov-submitted-tx': undefined
  'staking-gov-failed-tx': undefined
}

export const NavigationStack = createStackNavigator<Routes>()

export const useNavigateTo = () => {
  const navigation = useNavigation<StackNavigationProp<Routes>>()
  return useRef({
    home: () => navigation.navigate('staking-gov-home'),
    changeVote: () => navigation.navigate('staking-gov-change-vote'),
    notSupportedVersion: () => navigation.navigate('staking-gov-not-supported-version'),
    noFunds: () => navigation.navigate('staking-gov-no-funds'),
    submittedTx: () => navigation.navigate('staking-gov-submitted-tx'),
    failedTx: () => navigation.navigate('staking-gov-failed-tx'),
  }).current
}
