import {useNavigation} from '@react-navigation/native'
import {
  StackNavigationProp,
  createStackNavigator,
} from '@react-navigation/stack'
import {useRef} from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useResultNavigation} from '~/kernel/navigation/hooks/useResultNavigation'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {WalletStackRoutes} from '~/kernel/navigation/types'

export type Routes = {
  'staking-gov-home': undefined
  'staking-gov-change-vote': undefined
  'staking-gov-not-supported-version': undefined
  'staking-gov-no-funds': undefined
}

export const NavigationStack = createStackNavigator<Routes>()

export const useNavigateTo = () => {
  const navigation = useNavigation<StackNavigationProp<WalletStackRoutes>>()
  const strings = useStrings()
  const resultNavigation = useResultNavigation()
  const walletNavigation = useWalletNavigation()

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
      resultNavigation.showResultScreen({
        type: 'success',
        context: 'governance',
        title: strings.staking.submittedTxTitle,
        message: strings.staking.submittedTxText,
        primaryAction: {
          title: strings.staking.submittedTxButton,
          onPress: walletNavigation.resetToTxHistory,
        },
      }),
    failedTx: () =>
      resultNavigation.showResultScreen({
        type: 'error',
        context: 'governance',
        title: strings.staking.failedTxTitle,
        message: strings.staking.failedTxText,
        primaryAction: {
          title: strings.staking.failedTxButton,
          onPress: walletNavigation.resetToTxHistory,
        },
      }),
  }).current
}
