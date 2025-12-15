import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useResultNavigation} from '~/kernel/navigation/hooks/useResultNavigation'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {OperationContext} from '~/ui/ResultScreen/types'

export const useNavigateTo = () => {
  const resultNavigation = useResultNavigation()
  const strings = useStrings()
  const walletNavigation = useWalletNavigation()

  return React.useRef({
    showSubmittedTxScreen: (
      context?: OperationContext,
      params?: {
        title?: string
        message?: string
        buttonTitle?: string
      },
    ) => {
      resultNavigation.showResultScreen({
        type: 'success',
        context: context ?? 'default',
        title: params?.title,
        message: params?.message,
        primaryAction: {
          title: params?.buttonTitle ?? strings.txReview.submittedTxButton,
          onPress: walletNavigation.resetToTxHistory,
        },
      })
    },
    showFailedTxScreen: (
      context?: OperationContext,
      params?: {
        title?: string
        message?: string
        buttonTitle?: string
      },
    ) => {
      resultNavigation.showResultScreen({
        type: 'error',
        context: context ?? 'default',
        title: params?.title,
        message: params?.message,
        primaryAction: {
          title: params?.buttonTitle ?? strings.txReview.failedTxButton,
          onPress: walletNavigation.resetToTxHistory,
        },
      })
    },
  } as const).current
}
