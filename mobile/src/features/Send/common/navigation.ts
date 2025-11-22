import {Portfolio} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useResultNavigation} from '~/kernel/navigation/hooks/useResultNavigation'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {
  AppRouteNavigation,
  TxHistoryRouteNavigation,
} from '~/kernel/navigation/types'

export const useNavigateTo = () => {
  const navigation = useNavigation<
    TxHistoryRouteNavigation & AppRouteNavigation
  >()
  const strings = useStrings()
  const resultNavigation = useResultNavigation()
  const walletNavigation = useWalletNavigation()

  return useRef({
    selectedTokens: () => navigation.navigate('send-list-amounts-to-send'),
    addToken: (
      {shouldPopPrevious}: {shouldPopPrevious: boolean} = {
        shouldPopPrevious: false,
      },
    ) => {
      if (shouldPopPrevious) navigation.pop()
      navigation.navigate('send-select-token-from-list')
    },
    startTx: () => navigation.navigate('send-start-tx'),
    editAmount: (amount: Portfolio.Token.Amount) =>
      navigation.navigate('send-edit-amount', {amount}),
    reader: () => navigation.navigate('scan-start', {insideFeature: 'send'}),
    submittedTx: () =>
      resultNavigation.showResultScreen({
        type: 'success',
        context: 'send',
        title: strings.send.submittedTxTitle,
        message: strings.send.submittedTxText,
        primaryAction: {
          title: strings.send.submittedTxButton,
          onPress: walletNavigation.resetToTxHistory,
        },
      }),
    failedTx: () =>
      resultNavigation.showResultScreen({
        type: 'error',
        context: 'send',
        title: strings.send.failedTxTitle,
        message: strings.send.failedTxText,
        primaryAction: {
          title: strings.send.failedTxButton,
          onPress: walletNavigation.resetToStartTransfer,
        },
      }),
    startTxAfterReset: () =>
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'manage-wallets',
            state: {
              routes: [
                {name: 'wallet-selection'},
                {
                  name: 'main-wallet-routes',
                  state: {
                    routes: [
                      {
                        name: 'history',
                        state: {
                          routes: [
                            {name: 'history-list'},
                            {name: 'send-start-tx'},
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      }),
  }).current
}
