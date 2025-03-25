import {useTheme} from '@yoroi/theme'
import {Balance, Notifications, Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Icon} from '../../../../components/Icon'
import {TransactionInfo} from '../../../../yoroi-wallets/types/other'
import {Token} from '../../../../yoroi-wallets/types/tokens'
import {asQuantity, Quantities} from '../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {NotificationItem} from './NotificationPopupItem'
import {SwipeOutWrapper} from './SwipeOutWrapper'
import {useStrings} from './useStrings'
import Quantity = Balance.Quantity

type Props = {
  event: Notifications.Event
  onPress: () => void
  onSwipeOut: () => void
  onExpired: () => void
}

export const TransactionReceivedNotificationPopup = ({event, onPress, onSwipeOut, onExpired}: Props) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  if (event.trigger !== Notifications.Trigger.TransactionReceived) return null

  const isIntraWallet = wallet.transactions[event.metadata.txId]?.direction === 'SELF'
  const isReceived = wallet.transactions[event.metadata.txId]?.direction === 'RECEIVED'
  const isSent = wallet.transactions[event.metadata.txId]?.direction === 'SENT'

  if (isIntraWallet) {
    return (
      <SwipeOutWrapper onSwipeOut={onSwipeOut} onExpired={onExpired} onPress={onPress}>
        <NotificationItem
          onPress={onPress}
          icon={
            <IconWrapper>
              <Icon.Direction transactionDirection="SELF" />
            </IconWrapper>
          }
          title={strings.intraWalletTransactionSent}
          description={strings.tapToView}
        />
      </SwipeOutWrapper>
    )
  }

  if (isReceived) {
    const tx: TransactionInfo | null = wallet.transactions[event.metadata.txId] ?? null
    if (tx === null) return null
    const details = getTransactionInfoDetails(tx, wallet.portfolioPrimaryTokenInfo)

    const label = details.hasReceivedMultipleAssets
      ? strings.multipleAssetsReceived
      : `${formatAssets(
          Quantities.format(details.firstAssetAmountReceived, details.firstReceivedAsset.denomination),
          details.firstReceivedAsset.name,
        )} ${strings.received}`

    return (
      <SwipeOutWrapper onSwipeOut={onSwipeOut} onExpired={onExpired} onPress={onPress}>
        <NotificationItem
          onPress={onPress}
          icon={
            <IconWrapper>
              <Icon.Direction transactionDirection="RECEIVED" />
            </IconWrapper>
          }
          title={label}
          description={strings.tapToView}
        />
      </SwipeOutWrapper>
    )
  }

  if (isSent) {
    const tx: TransactionInfo | null = wallet.transactions[event.metadata.txId] ?? null
    if (tx === null) return null
    const details = getTransactionInfoDetails(tx, wallet.portfolioPrimaryTokenInfo)

    const label = details.hasSentMultipleAssets
      ? strings.multipleAssetsSent
      : `${formatAssets(
          Quantities.format(details.firstAssetAmountSent, details.firstSentAsset.denomination),
          details?.firstSentAsset.name,
        )} ${strings.sent}`

    return (
      <SwipeOutWrapper onSwipeOut={onSwipeOut} onExpired={onExpired} onPress={onPress}>
        <NotificationItem
          onPress={onPress}
          icon={
            <IconWrapper>
              <Icon.Direction transactionDirection="SENT" />
            </IconWrapper>
          }
          title={label}
          description={strings.tapToView}
        />
      </SwipeOutWrapper>
    )
  }

  return null
}

const formatAssets = (quantity: string, name: string) => {
  const text = `${quantity} ${name}`
  return text.length > 15 ? `${text.slice(0, 15)}...` : text
}

const IconWrapper = ({children}: {children: React.ReactNode}) => {
  const {styles, colors} = useStyles()
  return <View style={[styles.icon, {backgroundColor: colors.iconBackground}]}>{children}</View>
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    icon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
  })

  return {styles, colors: {iconColor: color.secondary_600, iconBackground: color.secondary_100}}
}

const sumTokenFromTxData = (
  outputsOutputs: TransactionInfo['outputs'] | TransactionInfo['inputs'],
  identifier: string,
) => {
  return outputsOutputs.reduce<Quantity>((acc, output) => {
    const tokens = output.assets.filter((a) => a.identifier === identifier)
    const quantities = tokens.map((t) => asQuantity(t.amount))
    return Quantities.sum([acc, ...quantities])
  }, Quantities.zero)
}

const findToken = (tokens: Token[], identifier: string, primaryTokenInfo: Portfolio.Token.Info) => {
  if (identifier === primaryTokenInfo.id) {
    return {name: primaryTokenInfo.name, denomination: primaryTokenInfo.decimals}
  }

  const token = tokens.find((t) => t.identifier === identifier)
  const name = token?.metadata?.longName ?? token?.metadata?.ticker ?? identifier
  const denomination = token?.metadata.numberOfDecimals ?? 0
  return {name, denomination}
}

const sumPtFromOutputs = (outputs: TransactionInfo['outputs']) => {
  return outputs.reduce<Quantity>((acc, output) => {
    const amount = asQuantity(output.amount)
    return Quantities.sum([acc, amount])
  }, Quantities.zero)
}

const getTransactionInfoDetails = (info: TransactionInfo, primaryTokenInfo: Portfolio.Token.Info) => {
  const ptReceived = sumPtFromOutputs(info.outputs)
  const ptSent = sumPtFromOutputs(info.inputs)

  const hasReceivedPt = !Quantities.isZero(ptReceived)
  const hasSentPt = !Quantities.isZero(ptSent)

  const assetsReceived = info.outputs.flatMap((o) => o.assets)
  const assetsSent = info.inputs.flatMap((i) => i.assets)

  const hasReceivedMultipleAssets = assetsReceived.length > 1 || (assetsReceived.length === 1 && hasReceivedPt)
  const hasSentMultipleAssets = assetsSent.length > 1 || (assetsSent.length === 1 && hasSentPt)

  const firstAssetIdReceived = assetsReceived[0]?.identifier ?? primaryTokenInfo.id
  const firstAssetAmountReceived = hasReceivedPt ? ptReceived : sumTokenFromTxData(info.outputs, firstAssetIdReceived)
  const firstReceivedAsset = hasReceivedPt
    ? {name: primaryTokenInfo.name, denomination: primaryTokenInfo.decimals}
    : findToken(Object.values(info.tokens), firstAssetIdReceived, primaryTokenInfo)

  const firstAssetIdSent = assetsSent[0]?.identifier ?? primaryTokenInfo.id
  const firstAssetAmountSent = hasSentPt ? ptSent : sumTokenFromTxData(info.inputs, firstAssetIdSent)
  const firstSentAsset = hasSentPt
    ? {name: primaryTokenInfo.name, denomination: primaryTokenInfo.decimals}
    : findToken(Object.values(info.tokens), firstAssetIdSent, primaryTokenInfo)

  return {
    hasReceivedMultipleAssets,
    hasSentMultipleAssets,
    firstReceivedAsset,
    firstSentAsset,
    firstAssetAmountReceived,
    firstAssetAmountSent,
  }
}
