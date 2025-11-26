import {Chain} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import {
  StackNavigationProp,
  createStackNavigator,
} from '@react-navigation/stack'
import {useMemo} from 'react'
import {Linking} from 'react-native'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useResultNavigation} from '~/kernel/navigation/hooks/useResultNavigation'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {WalletStackRoutes} from '~/kernel/navigation/types'
import {ResultScreenParams} from '~/ui/ResultScreen/types'
import {Space} from '~/ui/Space/Space'

import {LearnMoreLink} from '../common/LearnMoreLink/LearnMoreLink'
import {NoFunds} from '../illustrations/NoFunds'

export type Routes = {
  'staking-gov-home': {drepId?: string} | undefined
  'staking-gov-change-vote': {drepId?: string} | undefined
  'staking-gov-not-supported-version': undefined
}

export const NavigationStack = createStackNavigator<Routes>()

export const useNavigateTo = () => {
  const navigation = useNavigation<StackNavigationProp<WalletStackRoutes>>()
  const strings = useStrings()
  const resultNavigation = useResultNavigation()
  const walletNavigation = useWalletNavigation()
  const {
    selected: {network},
  } = useWalletManager()

  return useMemo(() => {
    const handleBuyAda = () => {
      if (network === Chain.Network.Preprod) {
        Linking.openURL(
          'https://docs.cardano.org/cardano-testnets/tools/faucet/',
        )
        return
      }
      navigation.navigate('main-wallet-routes', {
        screen: 'history',
        params: {
          screen: 'exchange-create-order',
        },
      })
    }

    const buttonText =
      network === Chain.Network.Mainnet
        ? strings.staking.buyAda
        : strings.staking.goToFaucet

    const showResultScreen = (params: ResultScreenParams) => {
      navigation.navigate('review-tx-routes', {
        screen: 'result-screen',
        params,
      })
    }

    return {
      home: (params?: {drepId?: string}) =>
        navigation.navigate('governance', {
          screen: 'staking-gov-home',
          params,
        }),
      changeVote: (params?: {drepId?: string}) =>
        navigation.navigate('governance', {
          screen: 'staking-gov-change-vote',
          params,
        }),
      notSupportedVersion: () =>
        navigation.navigate('governance', {
          screen: 'staking-gov-not-supported-version',
        }),
      noFunds: () =>
        showResultScreen({
          type: 'error',
          context: 'governance',
          title: strings.staking.noFunds,
          message: '',
          icon: <NoFunds />,
          customContent: (
            <>
              <Space.Height.lg />
              <LearnMoreLink />
            </>
          ),
          primaryAction: {
            title: buttonText,
            onPress: handleBuyAda,
          },
        }),
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
    }
  }, [navigation, strings.staking, network, walletNavigation, resultNavigation])
}
