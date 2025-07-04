import {useNavigation} from '@react-navigation/native'
import {isNonNullable} from '@yoroi/common'
import {infoExtractName, isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import React from 'react'
import {useIntl} from 'react-intl'
import {Text, TouchableOpacity, View, ViewProps} from 'react-native'

import {Boundary, ResetError} from '../../../../components/Boundary/Boundary'
import {styleMap} from '../../../../components/Icon/Direction'
import {BalanceError} from '../../../../components/PairedBalance/PairedBalance'
import {TxHistoryRouteNavigation} from '../../../../kernel/navigation'
import {Icon} from '../../../../ui/Icon'
import {MultiToken} from '../../../../wallets/cardano/MultiToken'
import {YoroiWallet} from '../../../../wallets/cardano/types'
import {TransactionInfo} from '../../../../wallets/types/other'
import {
  formatDateRelative,
  formatTime,
  formatTokenFractional,
  formatTokenInteger,
} from '../../../../wallets/utils/format'
import {asQuantity} from '../../../../wallets/utils/utils'
import {useCurrencyPairing} from '../../../Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {usePrivacyMode} from '../../../Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from '../../common/strings'
import {useTxFilter} from './TxFilterProvider'

type Props = {
  transaction: TransactionInfo
}

export const TxListItem = ({transaction}: Props) => {
  const strings = useStrings()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {palette: p} = useTheme()
  const {wallet} = useSelectedWallet()
  const {tokenId} = useTxFilter()
  const tokenInfo =
    wallet.balances.records.get(tokenId ?? wallet.portfolioPrimaryTokenInfo.id)
      ?.info ?? wallet.portfolioPrimaryTokenInfo
  const isDefault = isPrimaryToken(tokenInfo)

  const intl = useIntl()

  const showDetails = () =>
    navigation.navigate('tx-details', {id: transaction.id})
  const submittedAt = isNonNullable(transaction.submittedAt)
    ? `${formatDateRelative(transaction.submittedAt, intl) + ', ' + formatTime(transaction.submittedAt, intl)}`
    : ''

  const amountAsMT = MultiToken.fromArray(transaction.amount)
  const amount: BigNumber = isDefault
    ? amountAsMT.getDefault()
    : (amountAsMT.get(tokenInfo.id) ?? new BigNumber(0))

  const assetLength = transaction.delta.filter(
    ({amount}) => amount !== '0',
  ).length
  return (
    <TouchableOpacity
      onPress={showDetails}
      activeOpacity={0.5}
      testID="txHistoryListItem"
      style={[a.flex_1, a.flex_row]}
    >
      <Left>
        <Icon.Direction
          size={25}
          transactionDirection={transaction.direction}
        />
      </Left>

      <Middle>
        <Text
          style={[
            a.body_2_md_medium,
            {color: styleMap(p)[transaction.direction].text},
          ]}
          testID="transactionDirection"
        >
          {strings.direction(transaction.direction as any)}
        </Text>

        <Text
          style={[{color: p.gray_600}, a.body_3_sm_regular]}
          testID="submittedAtText"
        >
          {submittedAt}
        </Text>
      </Middle>

      <Right>
        {transaction.amount.length > 0 ? (
          <Amount amount={amount} tokenInfo={tokenInfo} />
        ) : (
          <Text style={[{color: p.gray_900}, a.body_2_md_medium]}>- -</Text>
        )}

        <Row>
          {isDefault ? (
            <PairedPrice
              txId={transaction.id}
              wallet={wallet}
              amount={amount}
            />
          ) : (
            <Text
              style={[{color: p.gray_600}, a.body_3_sm_regular]}
            >{`${assetLength} ${strings.assets(assetLength)}`}</Text>
          )}
        </Row>
      </Right>
    </TouchableOpacity>
  )
}

const Row = ({style, ...props}: ViewProps) => (
  <View
    style={[style, {flexDirection: 'row', justifyContent: 'flex-end'}]}
    {...props}
  />
)
const Left = ({style, ...props}: ViewProps) => (
  <View style={[style, {padding: 4}]} {...props} />
)
const Middle = ({style, ...props}: ViewProps) => (
  <View
    style={[style, {flex: 1, justifyContent: 'center', padding: 4}]}
    {...props}
  />
)
const Right = ({style, ...props}: ViewProps) => (
  <View style={[style, {padding: 4}]} {...props} />
)
const Amount = ({
  amount,
  tokenInfo,
}: {
  amount: BigNumber
  tokenInfo: Portfolio.Token.Info
}) => {
  const {palette: p} = useTheme()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()

  return (
    <View style={[a.flex_1, a.flex_row]} testID="transactionAmount">
      <Text style={[{color: p.gray_900}, a.body_2_md_medium]}>
        {!isPrivacyActive &&
          formatTokenInteger(asQuantity(amount), tokenInfo, true)}
      </Text>

      <Text style={[{color: p.gray_900}, a.body_2_md_medium]}>
        {!isPrivacyActive
          ? formatTokenFractional(asQuantity(amount), tokenInfo)
          : privacyPlaceholder}
      </Text>

      <Text
        style={[{color: p.gray_900}, a.body_2_md_medium]}
      >{` ${infoExtractName(tokenInfo) ?? ''}`}</Text>
    </View>
  )
}

const PairedPrice = ({
  amount,
  wallet,
  txId,
}: {
  wallet: YoroiWallet
  amount: BigNumber
  txId: string
}) => {
  const {palette: p} = useTheme()

  return (
    <Boundary
      key={txId}
      loading={{size: 'small'}}
      error={{
        fallback: ({resetErrorBoundary}) => (
          <ResetError resetErrorBoundary={resetErrorBoundary}>
            <BalanceError
              textStyle={[{color: p.gray_600}, a.body_3_sm_regular]}
            />
          </ResetError>
        ),
      }}
    >
      <Price amount={amount} wallet={wallet} />
    </Boundary>
  )
}

const Price = ({amount, wallet}: {wallet: YoroiWallet; amount: BigNumber}) => {
  const {palette: p} = useTheme()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const {
    config,
    currency,
    ptActivity: {close: rate},
  } = useCurrencyPairing()

  const price = React.useMemo(() => {
    if (rate == null) return `... ${currency}`

    const normalizationFactor = Math.pow(
      10,
      wallet.portfolioPrimaryTokenInfo.decimals,
    )

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
    wallet.portfolioPrimaryTokenInfo.decimals,
  ])

  return (
    <Text
      style={[{color: p.gray_600}, a.body_3_sm_regular]}
      testID="pairedText"
    >
      {price}
    </Text>
  )
}
