import {useNavigation} from '@react-navigation/native'
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack'
import {useRef} from 'react'

import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {GovernanceVote} from '../types'

export type Routes = {
  'staking-gov-home'?: {
    navigateToStakingOnSuccess?: boolean
  }
  'staking-gov-change-vote': undefined
  'staking-gov-confirm-tx': {
    vote: GovernanceVote
    unsignedTx: YoroiUnsignedTx
    registerStakingKey?: boolean
    navigateToStakingOnSuccess?: boolean
  }
  'staking-gov-tx-success'?: {navigateToStaking?: boolean; kind: GovernanceVote['kind']}
  'staking-gov-tx-failed': undefined
  'staking-gov-no-funds': undefined
}

export const NavigationStack = createStackNavigator<Routes>()

export const useNavigateTo = () => {
  const navigation = useNavigation<StackNavigationProp<Routes>>()
  return useRef({
    home: () => navigation.navigate('staking-gov-home'),
    changeVote: () => navigation.navigate('staking-gov-change-vote'),
    confirmTx: (params: Routes['staking-gov-confirm-tx']) => navigation.navigate('staking-gov-confirm-tx', params),
    txSuccess: (params?: Routes['staking-gov-tx-success']) => navigation.navigate('staking-gov-tx-success', params),
    txFailed: () => navigation.navigate('staking-gov-tx-failed'),
    noFunds: () => navigation.navigate('staking-gov-no-funds'),
  }).current
}
