import {useTheme} from '@yoroi/theme'
import {Balance, Notifications, Portfolio} from '@yoroi/types'

import * as React from 'react'
import {View} from 'react-native'

import {useTransactionInfos} from '~/features/Transactions/hooks/useTransactionInfos'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'
import {NotificationItem} from '~/ui/NotificationItem/NotificationItem'
import {YoroiWallet} from '~/wallets/cardano/types'
import {TransactionInfo} from '~/wallets/types/other'
import {Token} from '~/wallets/types/tokens'
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
    const details = getTransactionInfoDetails(
      tx,
      wallet.portfolioPrimaryTokenInfo,
    )

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
    const details = getTransactionInfoDetails(
      tx,
      wallet.portfolioPrimaryTokenInfo,
    )

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

const sumTokenFromTxData = (
  outputsOutputs: TransactionInfo['outputs'] | TransactionInfo['inputs'],
  identifier: string,
) => {
  return outputsOutputs.reduce<Balance.Quantity>((acc, output) => {
    const tokens = output.assets.filter((a) => a.identifier === identifier)
    const quantities = tokens.map((t) => asQuantity(t.amount))
    return Quantities.sum([acc, ...quantities])
  }, Quantities.zero)
}

const findToken = (
  tokens: Token[],
  identifier: string,
  primaryTokenInfo: Portfolio.Token.Info,
) => {
  if (identifier === primaryTokenInfo.id) {
    return {
      name: primaryTokenInfo.name,
      denomination: primaryTokenInfo.decimals,
    }
  }

  const token = tokens.find((t) => t.identifier === identifier)
  const name =
    token?.metadata?.longName ?? token?.metadata?.ticker ?? identifier
  const denomination = token?.metadata.numberOfDecimals ?? 0
  return {name, denomination}
}

const sumPtFromOutputs = (outputs: TransactionInfo['outputs']) => {
  return outputs.reduce<Balance.Quantity>((acc, output) => {
    const amount = asQuantity(output.amount)
    return Quantities.sum([acc, amount])
  }, Quantities.zero)
}

const getTransactionInfoDetails = (
  info: TransactionInfo,
  primaryTokenInfo: Portfolio.Token.Info,
) => {
  const ptReceived = sumPtFromOutputs(info.outputs)
  const ptSent = sumPtFromOutputs(info.inputs)

  const assetsReceived = info.outputs.flatMap((o) => o.assets)
  const assetsSent = info.inputs.flatMap((i) => i.assets)

  const hasReceivedMultipleAssets = assetsReceived.length > 1
  const hasSentMultipleAssets = assetsSent.length > 1

  const firstAssetIdReceived =
    assetsReceived.length > 0
      ? assetsReceived[0]!.identifier
      : primaryTokenInfo.id
  const firstAssetAmountReceived =
    assetsReceived.length > 0
      ? sumTokenFromTxData(info.outputs, firstAssetIdReceived)
      : ptReceived
  const firstReceivedAsset =
    assetsReceived.length > 0
      ? findToken(
          Object.values(info.tokens),
          firstAssetIdReceived,
          primaryTokenInfo,
        )
      : {name: primaryTokenInfo.name, denomination: primaryTokenInfo.decimals}

  // Prioritize non-primary tokens for display
  const firstAssetIdSent =
    assetsSent.length > 0 ? assetsSent[0]!.identifier : primaryTokenInfo.id
  const firstAssetAmountSent =
    assetsSent.length > 0
      ? sumTokenFromTxData(info.inputs, firstAssetIdSent)
      : ptSent
  const firstSentAsset =
    assetsSent.length > 0
      ? findToken(
          Object.values(info.tokens),
          firstAssetIdSent,
          primaryTokenInfo,
        )
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

const formatAssets = (quantity: string, name: string) => {
  const truncatedName = name.length > 15 ? `${name.slice(0, 15)}...` : name
  return `${quantity} ${truncatedName}`
}
