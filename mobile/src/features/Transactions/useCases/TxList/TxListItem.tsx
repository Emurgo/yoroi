import {YoroiWallet} from '@yoroi/cardano-wallet/types'
import {
  formatDateRelative,
  formatTime,
  formatTokenFractional,
  formatTokenInteger,
} from '@yoroi/cardano-wallet/utils/format'
import {
  Amounts,
  Quantities,
  asQuantity,
} from '@yoroi/cardano-wallet/utils/utils'
import {isNonNullable} from '@yoroi/common'
import {infoExtractName, isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Balance, Portfolio, WalletTransaction} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'

import {useNavigation} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {Text, TouchableOpacity, View, ViewProps} from 'react-native'

// import {TxHistoryRouteNavigation} from '~/kernel/navigation/navigation'
import {useCurrencyPairing} from '~/features/Settings/context/CurrencyProvider'
import {usePrivacyMode} from '~/features/Settings/hooks/usePrivacyMode'
import {TransactionSummary} from '~/features/Transactions/common/types'
import {useStrings} from '~/kernel/i18n/useStrings'
import {TxHistoryRouteNavigation} from '~/kernel/navigation/types'
import {Boundary, ResetError} from '~/ui/Boundary/Boundary'
import {Icon} from '~/ui/Icon'
import {styleMap} from '~/ui/Icon/Direction'
import {BalanceError} from '~/ui/PairedBalance/PairedBalance'

import {getOperationDisplayText} from '../../common/operationDisplay'
import {useTxFilter} from './TxFilterProvider'

type Props = {
  transaction: TransactionSummary
}

const TxListItemComponent = ({transaction}: Props) => {
  const strings = useStrings()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {palette: p} = useTheme()
  const {wallet} = useSelectedWallet()
  const {tokenId} = useTxFilter()
  const tokenInfo =
    wallet
      .balances()
      .records.get(tokenId ?? wallet.portfolioPrimaryTokenInfo.id)?.info ??
    wallet.portfolioPrimaryTokenInfo
  const isDefault = isPrimaryToken(tokenInfo)

  const intl = useIntl()

  // Get operation display text if available (using certificates from summary)
  const operationText = React.useMemo(() => {
    // Create a minimal WalletTransaction-like object with just the fields we need
    const walletTransactionLike = {
      id: transaction.id,
      certificates: transaction.certificates,
      withdrawals: transaction.withdrawals,
      metadata: transaction.metadata,
      inputs: transaction.inputs,
      outputs: transaction.outputs,
    } as WalletTransaction | undefined
    return getOperationDisplayText(
      walletTransactionLike,
      strings,
      transaction.direction,
      transaction.amount,
      transaction.metadata,
      transaction.inputs,
      transaction.outputs,
      transaction.delta,
    )
  }, [
    transaction.id,
    transaction.direction,
    transaction.certificates,
    transaction.withdrawals,
    transaction.amount,
    transaction.metadata,
    transaction.inputs,
    transaction.outputs,
    transaction.delta,
    strings,
  ])

  const showDetails = () =>
    navigation.navigate('tx-details', {id: transaction.id})
  const submittedAt = isNonNullable(transaction.submittedAt)
    ? `${formatDateRelative(transaction.submittedAt, intl, {today: strings.global.today, yesterday: strings.global.yesterday}) + ', ' + formatTime(transaction.submittedAt, intl)}`
    : ''

  const amountQuantity = isDefault
    ? Amounts.getAmount(transaction.amount, wallet.portfolioPrimaryTokenInfo.id)
        .quantity
    : Amounts.getAmount(transaction.amount, tokenInfo.id).quantity
  const amount = new BigNumber(amountQuantity)

  const assetLength = Amounts.toArray(transaction.delta).filter(
    ({quantity}) => !Quantities.isZero(quantity),
  ).length

  // Check if transaction has multiple assets (more than just primary token)
  const hasMultipleAssets = React.useMemo(() => {
    const amountArray = Amounts.toArray(transaction.amount).filter(
      ({quantity}) => !Quantities.isZero(quantity),
    )
    return amountArray.length > 1
  }, [transaction.amount])

  // Determine display text: use operation text if available, otherwise use direction
  const displayText =
    operationText ??
    strings.transactions.direction({direction: transaction.direction})

  // Determine icon key for styling (matches icon selection logic)
  const getIconKeyForStyle = (
    direction: 'SENT' | 'RECEIVED' | 'SELF' | 'MULTI',
    operation: string | null | undefined,
  ):
    | 'SENT'
    | 'RECEIVED'
    | 'SELF'
    | 'MULTI'
    | 'WITHDRAWAL'
    | 'SWAP'
    | 'SMART_CONTRACT'
    | 'STAKE_REGISTRATION'
    | 'STAKE_DEREGISTRATION'
    | 'STAKE_DELEGATION'
    | 'STAKE_UNDELEGATION'
    | 'VOTE_DELEGATION'
    | 'COLLATERAL_CREATION'
    | 'MINT'
    | 'BURN' => {
    if (!operation) {
      return direction
    }

    const opLower = operation.toLowerCase()

    if (opLower.includes('collateral creation')) {
      return 'COLLATERAL_CREATION'
    }
    if (opLower.includes('withdrawal')) {
      return 'WITHDRAWAL'
    }
    if (opLower.includes('burn')) {
      return 'BURN'
    }
    if (opLower.includes('mint')) {
      return 'MINT'
    }
    if (
      opLower.includes('swap') ||
      opLower.includes('swap created') ||
      opLower.includes('swap resolved') ||
      opLower.includes('swap cancel')
    ) {
      return 'SWAP'
    }
    if (opLower.includes('smart contract')) {
      return 'SMART_CONTRACT'
    }
    if (opLower.includes('stake undelegation')) {
      return 'STAKE_UNDELEGATION'
    }
    if (opLower.includes('staking delegated')) {
      return 'STAKE_DELEGATION'
    }
    if (opLower.includes('stake deregistration')) {
      return 'STAKE_DEREGISTRATION'
    }
    if (opLower.includes('stake delegation')) {
      return 'STAKE_DELEGATION'
    }
    if (opLower.includes('stake registration')) {
      return 'STAKE_REGISTRATION'
    }
    if (opLower.includes('vote delegation')) {
      return 'VOTE_DELEGATION'
    }

    return direction
  }

  const iconKeyForStyle = getIconKeyForStyle(
    transaction.direction,
    operationText,
  )

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
          operation={operationText}
        />
      </Left>

      <Middle>
        <Text
          style={[
            a.body_2_md_medium,
            {color: styleMap(p)[iconKeyForStyle].text},
          ]}
          testID="transactionDirection"
        >
          {displayText}
        </Text>

        <Text
          style={[{color: p.gray_600}, a.body_3_sm_regular]}
          testID="submittedAtText"
        >
          {submittedAt}
        </Text>
      </Middle>

      <Right>
        {Object.keys(transaction.amount).length > 0 ? (
          <View style={[a.flex_row, a.align_center, a.gap_xs, {flexShrink: 1}]}>
            {hasMultipleAssets && isDefault && (
              <Icon.TabPortfolio size={16} color={p.gray_900} />
            )}
            <View style={{flexShrink: 1}}>
              <Amount amount={amount} tokenInfo={tokenInfo} />
            </View>
          </View>
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
            >{`${assetLength} ${strings.transactions.assets(assetLength)}`}</Text>
          )}
        </Row>
      </Right>
    </TouchableOpacity>
  )
}

// Helper function to compare amounts without expensive JSON.stringify
const areAmountsEqual = (
  amounts1: Balance.Amounts,
  amounts2: Balance.Amounts,
): boolean => {
  const keys1 = Object.keys(amounts1)
  const keys2 = Object.keys(amounts2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    const tokenId = key as Portfolio.Token.Id
    if (amounts1[tokenId] !== amounts2[tokenId]) return false
  }

  return true
}

export const TxListItem = React.memo(
  TxListItemComponent,
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if transaction ID or key properties change
    // Optimized: replaced JSON.stringify with efficient amount comparison
    return (
      prevProps.transaction.id === nextProps.transaction.id &&
      prevProps.transaction.direction === nextProps.transaction.direction &&
      areAmountsEqual(
        prevProps.transaction.amount,
        nextProps.transaction.amount,
      ) &&
      prevProps.transaction.submittedAt === nextProps.transaction.submittedAt
    )
  },
)

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
  <View
    style={[style, {padding: 4, alignItems: 'flex-end', minWidth: 0}]}
    {...props}
  />
)
const Amount = ({
  amount,
  tokenInfo,
}: {
  amount: BigNumber
  tokenInfo: Portfolio.Token.Info
}) => {
  const {palette: p} = useTheme()
  const {isPrivacyModeEnabled, privacyPlaceholder} = usePrivacyMode()

  return (
    <View style={[a.flex_row, {flexShrink: 1}]} testID="transactionAmount">
      <Text style={[{color: p.gray_900}, a.body_2_md_medium]} numberOfLines={1}>
        {!isPrivacyModeEnabled &&
          formatTokenInteger(asQuantity(amount), tokenInfo, true)}
      </Text>

      <Text style={[{color: p.gray_900}, a.body_2_md_medium]} numberOfLines={1}>
        {!isPrivacyModeEnabled
          ? formatTokenFractional(asQuantity(amount), tokenInfo)
          : privacyPlaceholder}
      </Text>

      <Text
        style={[{color: p.gray_900}, a.body_2_md_medium]}
        numberOfLines={1}
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
  const {isPrivacyModeEnabled, privacyPlaceholder} = usePrivacyMode()
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

    return !isPrivacyModeEnabled ? total : `${privacyPlaceholder} ${currency}`
  }, [
    amount,
    config.decimals,
    currency,
    isPrivacyModeEnabled,
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
