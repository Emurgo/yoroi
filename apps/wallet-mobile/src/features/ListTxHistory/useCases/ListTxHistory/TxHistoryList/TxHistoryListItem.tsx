/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import {isNonNullable} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import {BigNumber} from 'bignumber.js'
import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, Text, TouchableOpacity, View, ViewProps} from 'react-native'

import {Boundary, ResetError} from '../../../../../components'
import {Icon} from '../../../../../components/Icon'
import {colorsMap} from '../../../../../components/Icon/Direction'
import {BalanceError} from '../../../../../components/PairedBalance/PairedBalance'
import {TxHistoryRouteNavigation} from '../../../../../kernel/navigation'
import {MultiToken} from '../../../../../yoroi-wallets/cardano/MultiToken'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {TransactionAssurance, TransactionInfo} from '../../../../../yoroi-wallets/types'
import {asQuantity} from '../../../../../yoroi-wallets/utils'
import {
  formatDateRelative,
  formatTime,
  formatTokenFractional,
  formatTokenInteger,
} from '../../../../../yoroi-wallets/utils/format'
import {useCurrencyPairing} from '../../../../Settings/Currency'
import {usePrivacyMode} from '../../../../Settings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from '../../../common/strings'

type Props = {
  transaction: TransactionInfo
}

export const TxHistoryListItem = ({transaction}: Props) => {
  const strings = useStrings()
  const {styles, colors, isDark} = useStyles()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {color} = useTheme()

  const {wallet} = useSelectedWallet()
  const intl = useIntl()

  const showDetails = () => navigation.navigate('history-details', {id: transaction.id})
  const submittedAt = isNonNullable(transaction.submittedAt)
    ? `${formatDateRelative(transaction.submittedAt, intl) + ', ' + formatTime(transaction.submittedAt, intl)}`
    : ''

  const rootBgColor = bgColorByAssurance(transaction.assurance, colors)

  const amountAsMT = MultiToken.fromArray(transaction.amount)
  const amount: BigNumber = amountAsMT.getDefault()

  return (
    <TouchableOpacity
      onPress={showDetails}
      activeOpacity={0.5}
      testID="txHistoryListItem"
      style={[styles.item, {backgroundColor: isDark ? colors.background : rootBgColor}]}
    >
      <Left>
        <Icon.Direction size={32} transaction={transaction} />
      </Left>

      <Middle>
        <Text
          style={[styles.direction, {color: colorsMap(color)[transaction.direction].text}]}
          testID="transactionDirection"
        >
          {strings.direction(transaction.direction as any)}
        </Text>

        <Text style={styles.date} testID="submittedAtText">
          {submittedAt}
        </Text>
      </Middle>

      <Right>
        {transaction.amount.length > 0 ? (
          <Amount wallet={wallet} amount={amount} />
        ) : (
          <Text style={styles.amount}>- -</Text>
        )}

        <Row>
          <PairedPrice txId={transaction.id} wallet={wallet} amount={amount} />
        </Row>
      </Right>
    </TouchableOpacity>
  )
}

const Row = ({style, ...props}: ViewProps) => (
  <View style={[style, {flexDirection: 'row', justifyContent: 'flex-end'}]} {...props} />
)
const Left = ({style, ...props}: ViewProps) => <View style={[style, {padding: 4}]} {...props} />
const Middle = ({style, ...props}: ViewProps) => (
  <View style={[style, {flex: 1, justifyContent: 'center', padding: 4}]} {...props} />
)
const Right = ({style, ...props}: ViewProps) => <View style={[style, {padding: 4}]} {...props} />
const Amount = ({wallet, amount}: {wallet: YoroiWallet; amount: BigNumber}) => {
  const {styles} = useStyles()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()

  return (
    <View style={styles.amountContainer} testID="transactionAmount">
      <Text style={styles.amount}>
        {!isPrivacyActive && formatTokenInteger(asQuantity(amount), wallet.primaryToken, true)}
      </Text>

      <Text style={styles.amount}>
        {!isPrivacyActive ? formatTokenFractional(asQuantity(amount), wallet.primaryToken) : privacyPlaceholder}
      </Text>

      <Text style={styles.amount}>{` ${wallet.primaryTokenInfo.name}`}</Text>
    </View>
  )
}

const PairedPrice = ({amount, wallet, txId}: {wallet: YoroiWallet; amount: BigNumber; txId: string}) => {
  const {styles} = useStyles()
  const {currency} = useCurrencyPairing()

  return (
    <Boundary
      key={txId}
      loading={{size: 'small'}}
      error={{
        fallback: ({resetErrorBoundary}) => (
          <ResetError resetErrorBoundary={resetErrorBoundary}>
            <BalanceError textStyle={styles.pair} currency={currency} />
          </ResetError>
        ),
      }}
    >
      <Price amount={amount} wallet={wallet} />
    </Boundary>
  )
}

const Price = ({amount, wallet}: {wallet: YoroiWallet; amount: BigNumber}) => {
  const {styles} = useStyles()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const {
    config,
    currency,
    adaPrice: {price: rate},
  } = useCurrencyPairing()

  const price = React.useMemo(() => {
    if (rate == null) return `... ${currency}`

    const normalizationFactor = Math.pow(10, wallet.primaryToken.metadata.numberOfDecimals)

    const priceBn = amount.dividedBy(normalizationFactor).times(rate)
    const isPositive = priceBn.isPositive()
    const price = priceBn.toFormat(config.decimals)
    const total = `${isPositive ? `+${price}` : `${price}`} ${currency}`

    return !isPrivacyActive ? total : `${privacyPlaceholder} ${currency}`
  }, [
    amount,
    config.decimals,
    currency,
    isPrivacyActive,
    privacyPlaceholder,
    rate,
    wallet.primaryToken.metadata.numberOfDecimals,
  ])

  return (
    <Text style={styles.pair} testID="pairedText">
      {price}
    </Text>
  )
}

const useStyles = () => {
  const {color, atoms, isDark} = useTheme()
  const styles = StyleSheet.create({
    pair: {
      color: color.gray_c600,
      ...atoms.body_3_sm_regular,
    },
    date: {
      color: color.gray_c600,
      ...atoms.body_3_sm_regular,
    },
    direction: {
      ...atoms.body_2_md_medium,
    },
    item: {
      flex: 1,
      flexDirection: 'row',
    },
    amountContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    amount: {
      color: color.gray_c900,
      ...atoms.body_2_md_medium,
    },
  })

  const colors = {
    default: color.white_static,
    failed: color.primary_c200,
    background: color.gray_cmin,
  }
  return {styles, colors, isDark}
}

const bgColorByAssurance = (assurance: TransactionAssurance, colors: {failed: string; default: string}) => {
  switch (assurance) {
    case 'PENDING':
      return 'rgba(207, 217, 224, 0.6)'
    case 'FAILED':
      return colors.failed
    default:
      return colors.default
  }
}