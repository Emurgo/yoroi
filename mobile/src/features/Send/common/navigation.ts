import {Portfolio} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {
  AppRouteNavigation,
  TxHistoryRouteNavigation,
} from '~/kernel/navigation/types'

export const useNavigateTo = () => {
  const navigation = useNavigation<
    TxHistoryRouteNavigation & AppRouteNavigation
  >()
  const strings = useStrings()

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
      navigation.navigate('send-submitted-tx', {
        title: strings.send.submittedTxTitle,
        message: strings.send.submittedTxText,
        buttonTitle: strings.send.submittedTxButton,
      }),
    failedTx: () =>
      navigation.navigate('send-failed-tx', {
        title: strings.send.failedTxTitle,
        message: strings.send.failedTxText,
        buttonTitle: strings.send.failedTxButton,
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
