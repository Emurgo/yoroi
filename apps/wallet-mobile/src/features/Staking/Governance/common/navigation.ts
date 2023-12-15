import {useNavigation} from '@react-navigation/native'
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack'
import {useRef} from 'react'

import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {GovernanceVote} from '../types'

export type Routes = {
  home: undefined
  'change-vote': undefined
  'confirm-tx': {vote: GovernanceVote; unsignedTx: YoroiUnsignedTx; registerStakingKey?: boolean}
  'tx-success': undefined
  'tx-failed': undefined
}

export const NavigationStack = createStackNavigator<Routes>()

export const useNavigateTo = () => {
  const navigation = useNavigation<StackNavigationProp<Routes>>()
  return useRef({
    home: () => navigation.navigate('home'),
    changeVote: () => navigation.navigate('change-vote'),
    confirmTx: (params: Routes['confirm-tx']) => navigation.navigate('confirm-tx', params),
    txSuccess: () => navigation.navigate('tx-success'),
    txFailed: () => navigation.navigate('tx-failed'),
  }).current
}
