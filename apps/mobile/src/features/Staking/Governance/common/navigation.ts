import {useNavigation} from '@react-navigation/native'
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack'
import {useRef} from 'react'

import {WalletStackRoutes} from '~/kernel/navigation'

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
  const navigation = useNavigation<StackNavigationProp<WalletStackRoutes>>()
  return useRef({
    home: () => navigation.navigate('governance', {screen: 'staking-gov-home'}),
    changeVote: () =>
      navigation.navigate('governance', {screen: 'staking-gov-change-vote'}),
    notSupportedVersion: () =>
      navigation.navigate('governance', {
        screen: 'staking-gov-not-supported-version',
      }),
    noFunds: () =>
      navigation.navigate('governance', {screen: 'staking-gov-no-funds'}),
    submittedTx: () =>
      navigation.navigate('governance', {screen: 'staking-gov-submitted-tx'}),
    failedTx: () =>
      navigation.navigate('governance', {screen: 'staking-gov-failed-tx'}),
  }).current
}
