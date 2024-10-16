import {useNavigation} from '@react-navigation/native'
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack'
import {useRef} from 'react'

import {GovernanceVote} from '../types'

export type Routes = {
  'staking-gov-home'?: {
    navigateToStakingOnSuccess?: boolean
  }
  'staking-gov-change-vote': undefined
  'staking-gov-tx-success'?: {navigateToStaking?: boolean; kind: GovernanceVote['kind']}
  'staking-gov-tx-failed': undefined
  'staking-gov-not-supported-version': undefined
  'staking-gov-no-funds': undefined
}

export const NavigationStack = createStackNavigator<Routes>()

export const useNavigateTo = () => {
  const navigation = useNavigation<StackNavigationProp<Routes>>()
  return useRef({
    home: () => navigation.navigate('staking-gov-home'),
    changeVote: () => navigation.navigate('staking-gov-change-vote'),
    txSuccess: (params?: Routes['staking-gov-tx-success']) => navigation.navigate('staking-gov-tx-success', params),
    txFailed: () => navigation.navigate('staking-gov-tx-failed'),
    notSupportedVersion: () => navigation.navigate('staking-gov-not-supported-version'),
    noFunds: () => navigation.navigate('staking-gov-no-funds'),
  }).current
}
