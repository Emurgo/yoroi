import {amountBreakdown, isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {Text, TextStyle} from 'react-native'

import {usePortfolio} from '~/features/Portfolio/context/PortfolioProvider'
import {usePortfolioTokenActivity} from '~/features/Portfolio/context/PortfolioTokenActivityProvider'
import {useCurrencyPairing} from '~/features/Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {usePrivacyMode} from '~/features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Boundary, ResetError, ResetErrorRef} from '../Boundary/Boundary'

type Props = {
  amount: Portfolio.Token.Amount
  ignorePrivacy?: boolean
  textStyle?: TextStyle
  hidePrimaryPair?: boolean
}

export const PairedBalance = React.forwardRef<ResetErrorRef, Props>(
  (props, ref) => {
    return (
      <Boundary
        key={props.amount.info.id}
        loading={{size: 'small'}}
        error={{
          fallback: ({resetErrorBoundary}) => (
            <ResetError resetErrorBoundary={resetErrorBoundary} ref={ref}>
              <BalanceError textStyle={props.textStyle} />
            </ResetError>
          ),
        }}
      >
        <Price {...props} />
      </Boundary>
    )
  },
)

const Price = ({amount, textStyle, ignorePrivacy, hidePrimaryPair}: Props) => {
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const {isPrimaryTokenActive} = usePortfolio()
  const {
    selected: {networkManager},
  } = useWalletManager()
  const portfolioPrimaryTokenInfo = networkManager.primaryTokenInfo
  const {atoms: ta, palette: p} = useTheme()

  const {
    currency: selectedCurrency,
    config,
    ptActivity: {close: ptPrice},
  } = useCurrencyPairing()
  const {tokenActivity} = usePortfolioTokenActivity()

  const price = React.useMemo(() => {
    const tokenPrice = tokenActivity[amount.info.id]?.price.close

    const showingAda =
      isPrimaryTokenActive && amount.info.id !== portfolioPrimaryTokenInfo.id
    const currency = showingAda
      ? portfolioPrimaryTokenInfo.ticker
      : selectedCurrency
    const decimals = showingAda
      ? portfolioPrimaryTokenInfo.decimals
      : config.decimals

    if (ptPrice == null) return `... ${currency}`

    if (isPrivacyActive && !ignorePrivacy)
      return `${privacyPlaceholder} ${currency}`

    if (!isPrimaryToken(amount.info) && tokenPrice == null)
      return `— ${currency}`

    if (hidePrimaryPair && isPrimaryToken(amount.info) && isPrimaryTokenActive)
      return ''

    return `${amountBreakdown(amount)
      .bn.times(tokenPrice ?? 1)
      .times(showingAda ? 1 : ptPrice)
      .toFormat(decimals)} ${currency}`
  }, [
    tokenActivity,
    amount,
    isPrimaryTokenActive,
    portfolioPrimaryTokenInfo.id,
    portfolioPrimaryTokenInfo.ticker,
    portfolioPrimaryTokenInfo.decimals,
    selectedCurrency,
    config.decimals,
    ptPrice,
    isPrivacyActive,
    ignorePrivacy,
    privacyPlaceholder,
    hidePrimaryPair,
  ])

  return (
    <Text
      style={[a.body_3_sm_regular, {color: p.text_gray_medium}, textStyle]}
      testID="pairedTotalText"
    >
      {price}
    </Text>
  )
}

export const BalanceError = ({
  textStyle,
}: {
  textStyle?: TextStyle | TextStyle[]
}) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {currency} = useCurrencyPairing()

  return (
    <Text style={[a.body_3_sm_regular, {color: p.text_gray_medium}, textStyle]}>
      {strings.ui.pairedBalanceError(currency)}
    </Text>
  )
}
