import {useTheme} from '@yoroi/theme'
import {Notifications, Portfolio} from '@yoroi/types'

import BigNumber from 'bignumber.js'
import * as React from 'react'
import {View} from 'react-native'

import {useTransactionInfos} from '~/features/Transactions/hooks/useTransactionInfos'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'
import {NotificationItem} from '~/ui/NotificationItem/NotificationItem'
import {MultiToken} from '~/wallets/cardano/MultiToken'
import {YoroiWallet} from '~/wallets/cardano/types'
import {TransactionInfo} from '~/wallets/types/other'
import {Quantities, asQuantity} from '~/wallets/utils/utils'

export const getTransactionReceivedNotificationTitle = (
  event: Notifications.Event,
  strings: ReturnType<typeof useStrings>,
  transactions: Record<string, TransactionInfo>,
  wallet: YoroiWallet,
): string => {
  if (event.trigger !== Notifications.Trigger.TransactionReceived) return ''

  const tx = transactions[event.metadata.txId]

  if (tx == null) {
    return `Unknown transaction ${event.metadata.txId}`
  }

  const isIntraWallet = tx.direction === 'SELF'
  const isReceived = tx.direction === 'RECEIVED'
  const isSent = tx.direction === 'SENT'

  if (isIntraWallet) {
    return strings.notifications.intraWalletTransactionSent
  }

  if (isReceived) {
    const details = getTransactionInfoDetails(tx, wallet)

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
    const details = getTransactionInfoDetails(tx, wallet)

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
  transactions: Record<string, TransactionInfo>,
) => {
  if (event.trigger !== Notifications.Trigger.TransactionReceived) return null

  const tx = transactions[event.metadata.txId]

  const isIntraWallet = tx?.direction === 'SELF'
  const isReceived = tx?.direction === 'RECEIVED'
  const isSent = tx?.direction === 'SENT'
  const isMultiSig = tx?.direction === 'MULTI'

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
  const transactionInfos = useTransactionInfos({wallet})

  if (event.trigger !== Notifications.Trigger.TransactionReceived) return null

  return (
    <NotificationItem
      icon={<IconWrapper event={event} />}
      title={getTransactionReceivedNotificationTitle(
        event,
        strings,
        transactionInfos,
        wallet,
      )}
      description={strings.notifications.tapToView}
    />
  )
}
const IconWrapper = ({event}: {event: Notifications.Event}) => {
  const {palette: p} = useTheme()
  const {wallet} = useSelectedWallet()
  const transactionInfos = useTransactionInfos({wallet})

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
      {getTransactionReceivedNotificationIcon(event, transactionInfos)}
    </View>
  )
}

const getTransactionInfoDetails = (
  info: TransactionInfo,
  wallet: YoroiWallet,
) => {
  const primaryTokenInfo = wallet.portfolioPrimaryTokenInfo
  const deltaMT = MultiToken.fromArray(info.delta)
  const defaultId = primaryTokenInfo.id

  const nonDefaultEntries = deltaMT
    .nonDefaultEntries()
    .map((e) => ({id: e.identifier, amount: e.amount}))

  const positiveIds = nonDefaultEntries
    .filter(({amount}) => amount.gt(0))
    .map(({id}) => id)
  const negativeIds = nonDefaultEntries
    .filter(({amount}) => amount.lt(0))
    .map(({id}) => id)

  const ptDelta = asQuantity(deltaMT.getDefault().toString(10))

  const hasReceivedMultipleAssets = positiveIds.length > 1
  const hasSentMultipleAssets = negativeIds.length > 1

  // Received side: prefer an actually received non-primary token; fallback to primary if none
  const firstAssetIdReceived = positiveIds[0] ?? defaultId
  const firstAssetAmountReceived =
    positiveIds.length > 0
      ? asQuantity(deltaMT.get(firstAssetIdReceived)!.toString(10))
      : ptDelta
  const firstReceivedAsset =
    positiveIds.length > 0
      ? resolveTokenInfo(firstAssetIdReceived, info, wallet, primaryTokenInfo)
      : {name: primaryTokenInfo.name, denomination: primaryTokenInfo.decimals}

  // Sent side: prefer an actually sent non-primary token; fallback to primary if none
  const firstAssetIdSent = negativeIds[0] ?? defaultId
  const firstAssetAmountSent =
    negativeIds.length > 0
      ? asQuantity(deltaMT.get(firstAssetIdSent)!.abs().toString(10))
      : // for primary, use absolute
        asQuantity(new BigNumber(ptDelta).abs().toString(10))
  const firstSentAsset =
    negativeIds.length > 0
      ? resolveTokenInfo(firstAssetIdSent, info, wallet, primaryTokenInfo)
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
  info: TransactionInfo,
  wallet: YoroiWallet,
  primaryTokenInfo: Portfolio.Token.Info,
) => {
  if (identifier === primaryTokenInfo.id) {
    return {
      name: primaryTokenInfo.name,
      denomination: primaryTokenInfo.decimals,
    }
  }
  const walletRecord = wallet.balances.records.get(
    identifier as Portfolio.Token.Id,
  )?.info
  if (walletRecord != null) {
    const pick = (...vals: Array<string | undefined>) =>
      vals.find((v) => typeof v === 'string' && v.trim().length > 0) ??
      identifier
    const name = pick(walletRecord.ticker, walletRecord.name)
    return {name, denomination: walletRecord.decimals}
  }
  // fallback to tx-scoped tokens
  const token = Object.values(info.tokens).find(
    (t) => t.identifier === identifier,
  )
  const pick = (...vals: Array<string | null | undefined>) =>
    vals.find(
      (v) => typeof v === 'string' && (v as string).trim().length > 0,
    ) ?? identifier
  const name = pick(token?.metadata?.ticker, token?.metadata?.longName)
  const denomination =
    token?.metadata.numberOfDecimals ?? primaryTokenInfo.decimals ?? 0
  return {name, denomination}
}

const formatAssets = (quantity: string, name: string) => {
  const truncatedName = name.length > 15 ? `${name.slice(0, 15)}...` : name
  return `${quantity} ${truncatedName}`
}
