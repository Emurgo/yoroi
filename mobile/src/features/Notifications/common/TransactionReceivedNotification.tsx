import {YoroiWallet} from '@yoroi/cardano-wallet'
import {Notifications} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as React from 'react'

import {getOperationTypeKey} from '~/features/Transactions/common/getOperationTypeKey'
import {getOperationDisplayText} from '~/features/Transactions/common/operationDisplay'
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

  // Use the same display text logic as transaction list item
  const operationText = getOperationDisplayText(
    rawTx,
    strings,
    summary.direction,
    summary.amount,
    rawTx.metadata,
    rawTx.inputs,
    rawTx.outputs,
    summary.delta,
  )

  // Use operation text if available, otherwise fall back to direction
  return (
    operationText ??
    strings.transactions.direction({direction: summary.direction})
  )
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

  // Use the same operation type detection as transaction list item
  const operationTypeKey = getOperationTypeKey(
    rawTx,
    summary.direction,
    summary.amount,
    rawTx.metadata,
    rawTx.inputs,
    rawTx.outputs,
    summary.delta,
  )

  // Use Icon.Direction with operation prop to get the correct icon (same as transaction list)
  return (
    <Icon.Direction
      transactionDirection={summary.direction}
      operation={operationTypeKey}
    />
  )
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
  const {wallet} = useSelectedWallet()

  // Icon.Direction already handles its own container styling with proper background colors
  return getTransactionReceivedNotificationIcon(event, wallet)
}
