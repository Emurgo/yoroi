/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import _, {fromPairs} from 'lodash'
import React from 'react'
import {defineMessages, MessageDescriptor, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'

import {Spacer, Text} from '../../components'
import {Icon} from '../../components/Icon'
import {formatTimeToSeconds, formatTokenFractional, formatTokenInteger} from '../../legacy/format'
import utfSymbols from '../../legacy/utfSymbols'
import {TxHistoryRouteNavigation} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {isEmptyString} from '../../utils/utils'
import {MultiToken} from '../../yoroi-wallets/cardano/MultiToken'
import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {IOData, TransactionAssurance, TransactionDirection, TransactionInfo} from '../../yoroi-wallets/types'
import {asQuantity} from '../../yoroi-wallets/utils'

type Props = {
  transaction: TransactionInfo
}

export const TxHistoryListItem = ({transaction}: Props) => {
  const strings = useStrings()
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  const wallet = useSelectedWallet()

  const showDetails = () => navigation.navigate('history-details', {id: transaction.id})
  const submittedAt = formatTimeToSeconds(transaction.submittedAt)

  const isPending = transaction.assurance === 'PENDING'
  const isReceived = transaction.direction === 'RECEIVED'

  const rootBgColor = bgColorByAssurance(transaction.assurance)

  const internalAddressIndex = fromPairs(wallet.internalAddresses.map((addr, i) => [addr, i]))
  const externalAddressIndex = fromPairs(wallet.externalAddresses.map((addr, i) => [addr, i]))

  const fee = transaction.fee ? transaction.fee[0] : null
  const amountAsMT = MultiToken.fromArray(transaction.amount)
  const amount: BigNumber = amountAsMT.getDefault()

  const amountToDisplay = isEmptyString(fee?.amount) ? amount : amount.plus(new BigNumber(fee?.amount ?? 0))
  const amountStyle = amountToDisplay.eq(0)
    ? styles.neutralAmount
    : amountToDisplay.gte(0)
    ? styles.positiveAmount
    : styles.negativeAmount

  const outputsToMyWallet = isReceived
    ? getTxIOMyWallet(transaction.outputs, externalAddressIndex, internalAddressIndex)
    : []

  const totalAssets = outputsToMyWallet.reduce((acc, {assets}) => acc + Number(assets.length), 0)

  return (
    <TouchableOpacity
      onPress={showDetails}
      activeOpacity={0.5}
      testID="txHistoryListItem"
      style={[styles.item, {backgroundColor: rootBgColor}]}
    >
      <Left>
        <Icon.Direction transaction={transaction} />
      </Left>

      <Middle>
        <Text small secondary={isPending} testID="transactionDirection">
          {strings.direction(transaction.direction as any)}
        </Text>

        <Spacer height={4} />

        <Text secondary small testID="submittedAtText">
          {submittedAt}
        </Text>
      </Middle>

      <Right>
        {transaction.amount.length > 0 ? (
          <Amount wallet={wallet} transaction={transaction} />
        ) : (
          <Text style={amountStyle}>- -</Text>
        )}

        {totalAssets !== 0 && (
          <Row>
            <Text testID="totalAssetsText">{strings.assets(totalAssets)}</Text>
          </Row>
        )}
      </Right>
    </TouchableOpacity>
  )
}

const Row = ({style, ...props}: ViewProps) => <View style={[style, {flexDirection: 'row'}]} {...props} />
const Left = ({style, ...props}: ViewProps) => <View style={[style, {padding: 4}]} {...props} />
const Middle = ({style, ...props}: ViewProps) => (
  <View style={[style, {flex: 1, justifyContent: 'center', padding: 4}]} {...props} />
)
const Right = ({style, ...props}: ViewProps) => <View style={[style, {padding: 4}]} {...props} />
const Amount = ({wallet, transaction}: {wallet: YoroiWallet; transaction: TransactionInfo}) => {
  const amountAsMT = MultiToken.fromArray(transaction.amount)
  const amount: BigNumber = amountAsMT.getDefault()
  const fee = transaction.fee ? transaction.fee[0] : null
  const amountToDisplay = isEmptyString(fee?.amount) ? amount : amount.plus(new BigNumber(fee?.amount ?? 0))
  const style = amountToDisplay.eq(0)
    ? styles.neutralAmount
    : amountToDisplay.gte(0)
    ? styles.positiveAmount
    : styles.negativeAmount

  return (
    <View style={styles.amount} testID="transactionAmount">
      <Text style={style} secondary={transaction.assurance === 'PENDING'}>
        <Text>{formatTokenInteger(asQuantity(amount), wallet.primaryToken)}</Text>

        <Text small>{formatTokenFractional(asQuantity(amount), wallet.primaryToken)}</Text>
      </Text>

      <Text style={style}>{`${utfSymbols.NBSP}${wallet.primaryTokenInfo.metadata.symbol}`}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    elevation: 2,
    shadowOffset: {width: 0, height: -2},
    shadowRadius: 10,
    shadowOpacity: 0.08,
    shadowColor: '#181a1e',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  amount: {
    flex: 1,
    flexDirection: 'row',
  },
  positiveAmount: {
    color: COLORS.POSITIVE_AMOUNT,
  },
  negativeAmount: {
    color: COLORS.BLACK,
  },
  neutralAmount: {
    color: COLORS.BLACK,
  },
})

const messages = defineMessages({
  fee: {
    id: 'components.txhistory.txhistorylistitem.fee',
    defaultMessage: '!!!Fee',
  },
  transactionTypeSent: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeSent',
    defaultMessage: '!!!ADA sent',
  },
  transactionTypeReceived: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeReceived',
    defaultMessage: '!!!ADA received',
  },
  transactionTypeSelf: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeSelf',
    defaultMessage: '!!!Intrawallet',
  },
  transactionTypeMulti: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeMulti',
    defaultMessage: '!!!Multiparty',
  },
  assets: {
    id: 'global.txLabels.assets',
    defaultMessage: '!!!{cnt} assets',
    description: 'The number of assets different assets, not the amount',
  },
})

const filtersTxIO = (address: string) => {
  const isMyReceive = (extAddrIdx) => extAddrIdx[address] != null
  const isMyChange = (intAddrIdx) => intAddrIdx[address] != null
  const isMyAddress = (extAddrIdx, intAddrIdx) => isMyReceive(extAddrIdx) || isMyChange(intAddrIdx)
  return {
    isMyReceive,
    isMyChange,
    isMyAddress,
  }
}

const getTxIOMyWallet = (txIO: Array<IOData>, extAddrIdx, intAddrIdx) => {
  const io = _.uniq(txIO).map(({address, assets}) => ({
    address,
    assets,
  }))
  const filtered = io.filter(({address}) => filtersTxIO(address).isMyAddress(extAddrIdx, intAddrIdx))
  return filtered ?? []
}

const directionMessages: Record<TransactionDirection, MessageDescriptor> = Object.freeze({
  SENT: messages.transactionTypeSent,
  RECEIVED: messages.transactionTypeReceived,
  SELF: messages.transactionTypeSelf,
  MULTI: messages.transactionTypeMulti,
})

const useStrings = () => {
  const intl = useIntl()

  return {
    direction: (direction: TransactionDirection) => intl.formatMessage(directionMessages[direction]),
    assets: (qty: number) => intl.formatMessage(messages.assets, {cnt: qty}),
  }
}

const bgColorByAssurance = (assurance: TransactionAssurance) => {
  switch (assurance) {
    case 'PENDING':
      return 'rgba(207, 217, 224, 0.6)'
    case 'FAILED':
      return '#F8D7DA'
    default:
      return '#FFF'
  }
}
