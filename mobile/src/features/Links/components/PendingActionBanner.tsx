import {PendingAction, useLinks} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useStrings} from '~/kernel/i18n/useStrings'

/**
 * Get user-friendly message for pending action
 */
const getActionMessage = (
  pendingAction: PendingAction,
  strings: ReturnType<typeof useStrings>,
): string => {
  if (pendingAction.source === 'yoroi') {
    const useCase = pendingAction.action.info.useCase
    switch (useCase) {
      case 'request/ada':
      case 'request/ada-with-link':
        return strings.links.trustedPaymentRequestedTitle
      case 'launch':
        return strings.links.trustedBrowserLaunchDappUrlTitle
      case 'order/show-create-result':
        return strings.exchange.buySellCrypto
      default:
        return strings.global.proceed
    }
  } else {
    const action = pendingAction.action.action
    switch (action) {
      case 'send-single-pt':
      case 'send-only-receiver':
      case 'pay-request':
        return strings.send.sendTitle
      case 'claim':
        return strings.claim.askConfirmationTitle
      case 'browse-dapp':
        return strings.links.trustedBrowserLaunchDappUrlTitle
      case 'stake-pool':
        return strings.scan.stakePoolTitle
      case 'delegate-drep':
        return strings.staking.delegateToADRep
      case 'view-transaction':
        return strings.scan.transactionTitle
      case 'view-block':
        return strings.scan.blockTitle
      case 'view-address':
        return strings.scan.addressTitle
      case 'restore-wallet':
        return strings.setupWallet.restoreWalletTitle
      case 'p2p-connect':
        return strings.scan.p2pConnectTitle
      case 'launch-url':
        return strings.global.proceed
      default:
        return strings.global.proceed
    }
  }
}

/**
 * Banner component that displays pending link action information
 * Shows at the top of screens while user is authenticating or selecting wallet
 */
export const PendingActionBanner = () => {
  const {pendingAction} = useLinks()
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  if (!pendingAction) {
    return null
  }

  const message = getActionMessage(pendingAction, strings)

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        ta.bg_color_min,
        a.px_lg,
        a.py_md,
        {
          borderBottomWidth: 1,
          borderBottomColor: p.gray_200,
        },
      ]}
    >
      <View style={[a.flex_row, a.align_center, a.gap_sm]}>
        <View
          style={[
            {
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: p.primary_500,
            },
          ]}
        />
        <Text style={[a.body_2_md_regular, ta.text_gray_max]} numberOfLines={1}>
          {message}
        </Text>
      </View>
    </SafeAreaView>
  )
}
