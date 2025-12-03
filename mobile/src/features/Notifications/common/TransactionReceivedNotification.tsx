import {YoroiWallet} from '@yoroi/cardano-wallet/types'
import {Amounts, Quantities} from '@yoroi/cardano-wallet/utils/utils'
import {useTheme} from '@yoroi/theme'
import {Notifications, Portfolio} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'

import * as React from 'react'
import {View} from 'react-native'

import {walletTransactionToSummary} from '~/features/Transactions/common/transactionSummary'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'
import {NotificationItem} from '~/ui/NotificationItem/NotificationItem'

export const getTransactionReceivedNotificationTitle = (
  event: Notifications.Event,
  strings: ReturnType<typeof useStrings>,
  wallet: YoroiWallet,
): string => {
  if (event.trigger !== Notifications.Trigger.TransactionReceived) return ''

  const rawTx = wallet.getRawTransaction(event.metadata.txId)
  if (rawTx == null) {
    return `Unknown transaction ${event.metadata.txId}`
  }

  const ownAddresses = [
    ...wallet.internalAddresses(),
    ...wallet.externalAddresses(),
  ]
  const summary = walletTransactionToSummary(
    rawTx,
    ownAddresses,
    wallet.portfolioPrimaryTokenInfo,
  )

  const isIntraWallet = summary.direction === 'SELF'
  const isReceived = summary.direction === 'RECEIVED'
  const isSent = summary.direction === 'SENT'

  if (isIntraWallet) {
    return strings.notifications.intraWalletTransactionSent
  }

  if (isReceived) {
    const details = getTransactionSummaryDetails(summary, wallet)

    return details.hasReceivedMultipleAssets
      ? strings.notifications.multipleAssetsReceived
      : `${formatAssets(
          Quantities.format(
            details.firstAssetAmountReceived,
            details.firstReceivedAsset.denomination,
          ),
          details.firstReceivedAsset.name,
        )} ${strings.notifications.received}`
  }

  if (isSent) {
    const details = getTransactionSummaryDetails(summary, wallet)

    return details.hasSentMultipleAssets
      ? strings.notifications.multipleAssetsSent
      : `${formatAssets(
          Quantities.format(
            details.firstAssetAmountSent,
            details.firstSentAsset.denomination,
          ),
          details.firstSentAsset.name,
        )} ${strings.notifications.sent}`
  }

  return ''
}

export const getTransactionReceivedNotificationIcon = (
  event: Notifications.Event,
  wallet: YoroiWallet,
) => {
  if (event.trigger !== Notifications.Trigger.TransactionReceived) return null

  const rawTx = wallet.getRawTransaction(event.metadata.txId)
  if (!rawTx) return null

  const ownAddresses = [
    ...wallet.internalAddresses(),
    ...wallet.externalAddresses(),
  ]
  const summary = walletTransactionToSummary(
    rawTx,
    ownAddresses,
    wallet.portfolioPrimaryTokenInfo,
  )

  const isIntraWallet = summary.direction === 'SELF'
  const isReceived = summary.direction === 'RECEIVED'
  const isSent = summary.direction === 'SENT'
  const isMultiSig = summary.direction === 'MULTI'

  if (isIntraWallet) {
    return <Icon.Direction transactionDirection="SELF" />
  }

  if (isReceived) {
    return <Icon.Direction transactionDirection="RECEIVED" />
  }

  if (isSent) {
    return <Icon.Direction transactionDirection="SENT" />
  }

  if (isMultiSig) {
    return <Icon.Direction transactionDirection="MULTI" />
  }

  return null
}

export const TransactionReceivedNotification = ({
  event,
}: {
  event: Notifications.Event
}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()

  if (event.trigger !== Notifications.Trigger.TransactionReceived) return null

  return (
    <NotificationItem
      icon={<IconWrapper event={event} />}
      title={getTransactionReceivedNotificationTitle(event, strings, wallet)}
      description={strings.notifications.tapToView}
    />
  )
}
const IconWrapper = ({event}: {event: Notifications.Event}) => {
  const {palette: p} = useTheme()
  const {wallet} = useSelectedWallet()

  return (
    <View
      style={[
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        },
        {backgroundColor: p.secondary_100},
      ]}
    >
      {getTransactionReceivedNotificationIcon(event, wallet)}
    </View>
  )
}

const getTransactionSummaryDetails = (
  summary: ReturnType<typeof walletTransactionToSummary>,
  wallet: YoroiWallet,
) => {
  const primaryTokenInfo = wallet.portfolioPrimaryTokenInfo
  const defaultId = primaryTokenInfo.id

  // Convert delta to array of amounts and filter out zero amounts
  const deltaAmounts = Amounts.toArray(summary.delta).filter(
    ({quantity}) => !Quantities.isZero(quantity),
  )

  // Separate positive (received) and negative (sent) amounts
  const positiveAmounts = deltaAmounts.filter(({quantity}) =>
    Quantities.isGreaterThan(quantity, Quantities.zero),
  )
  const negativeAmounts = deltaAmounts.filter(({quantity}) =>
    Quantities.isGreaterThan(Quantities.zero, quantity),
  )

  // Get non-default token IDs (excluding primary token)
  const positiveIds = positiveAmounts
    .filter(({tokenId}) => tokenId !== defaultId)
    .map(({tokenId}) => tokenId)
  const negativeIds = negativeAmounts
    .filter(({tokenId}) => tokenId !== defaultId)
    .map(({tokenId}) => tokenId)

  // Get primary token delta
  const ptDelta = Amounts.getAmount(summary.delta, defaultId).quantity

  const hasReceivedMultipleAssets = positiveAmounts.length > 1
  const hasSentMultipleAssets = negativeAmounts.length > 1

  // Received side: prefer an actually received non-primary token; fallback to primary if none
  const firstAssetIdReceived = positiveIds[0] ?? defaultId
  const firstAssetAmountReceived =
    positiveIds.length > 0
      ? Amounts.getAmount(summary.delta, firstAssetIdReceived).quantity
      : ptDelta
  const firstReceivedAsset =
    positiveIds.length > 0
      ? resolveTokenInfo(firstAssetIdReceived, wallet, primaryTokenInfo)
      : {name: primaryTokenInfo.name, denomination: primaryTokenInfo.decimals}

  // Sent side: prefer an actually sent non-primary token; fallback to primary if none
  const firstAssetIdSent = negativeIds[0] ?? defaultId
  const firstAssetAmountSent =
    negativeIds.length > 0
      ? Quantities.negated(
          Amounts.getAmount(summary.delta, firstAssetIdSent).quantity,
        )
      : Quantities.negated(ptDelta)

  const firstSentAsset =
    negativeIds.length > 0
      ? resolveTokenInfo(firstAssetIdSent, wallet, primaryTokenInfo)
      : {name: primaryTokenInfo.name, denomination: primaryTokenInfo.decimals}

  return {
    hasReceivedMultipleAssets,
    hasSentMultipleAssets,
    firstReceivedAsset,
    firstSentAsset,
    firstAssetAmountReceived,
    firstAssetAmountSent,
  }
}

const resolveTokenInfo = (
  identifier: string,
  wallet: YoroiWallet,
  primaryTokenInfo: Portfolio.Token.Info,
) => {
  if (identifier === primaryTokenInfo.id) {
    return {
      name: primaryTokenInfo.name,
      denomination: primaryTokenInfo.decimals,
    }
  }
  const walletRecord = wallet
    .balances()
    .records.get(identifier as Portfolio.Token.Id)?.info
  if (walletRecord != null) {
    const pick = (...vals: Array<string | undefined>) =>
      vals.find((v) => typeof v === 'string' && v.trim().length > 0) ??
      identifier
    const name = pick(walletRecord.ticker, walletRecord.name)
    return {name, denomination: walletRecord.decimals}
  }
  // fallback: use identifier as name
  return {name: identifier, denomination: 0}
}

const formatAssets = (quantity: string, name: string) => {
  const truncatedName = name.length > 15 ? `${name.slice(0, 15)}...` : name
  return `${quantity} ${truncatedName}`
}
