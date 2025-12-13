import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'

import {OperationContext, ResultScreenConfig} from './types'

const getDefaultConfig = (
  context: OperationContext,
  type: 'success' | 'error',
  strings: ReturnType<typeof useStrings>,
  navigation: ReturnType<typeof useWalletNavigation>,
): ResultScreenConfig => {
  if (type === 'success') {
    switch (context) {
      case 'send':
      case 'swap':
      case 'governance':
      case 'delegate':
      case 'withdraw':
      case 'utxo-consolidation':
      default:
        return {
          defaultTitle: strings.txReview.submittedTxTitle,
          defaultMessage: strings.txReview.submittedTxText,
          defaultPrimaryAction: {
            title: strings.txReview.submittedTxButton,
            onPress: navigation.resetToTxHistory,
          },
        }
      case 'claim':
        return {
          defaultTitle: strings.txReview.submittedTxTitle,
          defaultMessage: strings.txReview.submittedTxText,
          defaultPrimaryAction: {
            title: strings.global.ok,
            onPress: navigation.resetToTxHistory,
          },
        }
    }
  } else {
    // error type
    switch (context) {
      case 'send':
        return {
          defaultTitle: strings.send.failedTxTitle,
          defaultMessage: strings.send.failedTxText,
          defaultPrimaryAction: {
            title: strings.send.failedTxButton,
            onPress: navigation.resetToStartTransfer,
          },
        }
      case 'swap':
      case 'governance':
      case 'delegate':
      case 'withdraw':
      case 'utxo-consolidation':
        return {
          defaultTitle: strings.txReview.failedTxTitle,
          defaultMessage: strings.txReview.failedTxText,
          defaultPrimaryAction: {
            title: strings.txReview.failedTxButton,
            onPress: navigation.resetToTxHistory,
          },
        }
      case 'airdrop':
        return {
          defaultTitle: strings.airdrop.redeemError,
          defaultMessage: strings.txReview.failedTxText,
          defaultPrimaryAction: {
            title: strings.txReview.failedTxButton,
            onPress: navigation.resetToTxHistory,
          },
        }
      default:
        return {
          defaultTitle: strings.txReview.failedTxTitle,
          defaultMessage: strings.txReview.failedTxText,
          defaultPrimaryAction: {
            title: strings.txReview.failedTxButton,
            onPress: navigation.resetToTxHistory,
          },
        }
      case 'exchange':
        return {
          defaultTitle: strings.exchange.linkError,
          defaultMessage: '',
          defaultPrimaryAction: {
            title: strings.global.close,
            onPress: navigation.resetToTxHistory,
          },
        }
    }
  }
}

export const useResultScreenDefaults = (
  context: OperationContext,
  type: 'success' | 'error' = 'error',
): ResultScreenConfig => {
  const strings = useStrings()
  const navigation = useWalletNavigation()

  return React.useMemo(
    () => getDefaultConfig(context, type, strings, navigation),
    [context, type, strings, navigation],
  )
}
