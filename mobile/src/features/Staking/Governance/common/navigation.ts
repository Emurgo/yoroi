import {useNavigation} from '@react-navigation/native'
import {
  StackNavigationProp,
  createStackNavigator,
} from '@react-navigation/stack'
import {useRef} from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {WalletStackRoutes} from '~/kernel/navigation/types'

export type Routes = {
  'staking-gov-home': undefined
  'staking-gov-change-vote': undefined
  'staking-gov-not-supported-version': undefined
  'staking-gov-no-funds': undefined
  'staking-gov-submitted-tx': {
    title?: string
    message?: string
    buttonTitle?: string
  }
  'staking-gov-failed-tx': {
    title?: string
    message?: string
    buttonTitle?: string
  }
}

export const NavigationStack = createStackNavigator<Routes>()

export const useNavigateTo = () => {
  const navigation = useNavigation<StackNavigationProp<WalletStackRoutes>>()
  const strings = useStrings()

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
      navigation.navigate('governance', {
        screen: 'staking-gov-submitted-tx',
        params: {
          title: strings.staking.submittedTxTitle,
          message: strings.staking.submittedTxText,
          buttonTitle: strings.staking.submittedTxButton,
        },
      }),
    failedTx: () =>
      navigation.navigate('governance', {
        screen: 'staking-gov-failed-tx',
        params: {
          title: strings.staking.failedTxTitle,
          message: strings.staking.failedTxText,
          buttonTitle: strings.staking.failedTxButton,
        },
      }),
  }).current
}
