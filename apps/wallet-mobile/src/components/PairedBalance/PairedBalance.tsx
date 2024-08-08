import {amountBreakdown, isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, TextStyle} from 'react-native'

import {usePortfolio} from '../../features/Portfolio/common/PortfolioProvider'
import {usePortfolioTokenActivity} from '../../features/Portfolio/common/PortfolioTokenActivityProvider'
import {useCurrencyPairing} from '../../features/Settings/Currency'
import {usePrivacyMode} from '../../features/Settings/PrivacyMode/PrivacyMode'
import {useWalletManager} from '../../features/WalletManager/context/WalletManagerProvider'
import {CurrencySymbol} from '../../yoroi-wallets/types'
import {Boundary, ResetError, ResetErrorRef} from '..'

type Props = {
  amount: Portfolio.Token.Amount
  ignorePrivacy?: boolean
  textStyle?: TextStyle
  hidePrimaryPair?: boolean
}
export const PairedBalance = React.forwardRef<ResetErrorRef, Props>((props, ref) => {
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
})

const Price = ({amount, textStyle, ignorePrivacy, hidePrimaryPair}: Props) => {
  const styles = useStyles()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const {isPrimaryTokenActive} = usePortfolio()
  const {
    selected: {networkManager},
  } = useWalletManager()
  const portfolioPrimaryTokenInfo = networkManager.primaryTokenInfo

  const {
    currency: selectedCurrency,
    config,
    adaPrice: {price: adaPrice},
  } = useCurrencyPairing()
  const {tokenActivity} = usePortfolioTokenActivity()

  const price = React.useMemo(() => {
    const tokenPrice = tokenActivity?.[amount.info.id]?.price24h?.close

    const showingAda = isPrimaryTokenActive && amount.info.id !== portfolioPrimaryTokenInfo.id
    const currency = showingAda ? portfolioPrimaryTokenInfo.ticker : selectedCurrency
    const decimals = showingAda ? portfolioPrimaryTokenInfo.decimals : config.decimals

    if (adaPrice == null) return `... ${currency}`

    if (isPrivacyActive && !ignorePrivacy) return `${privacyPlaceholder} ${currency}`

    if (!isPrimaryToken(amount.info) && !tokenPrice) return ''

    if (hidePrimaryPair && isPrimaryToken(amount.info) && isPrimaryTokenActive) return ''

    return `${amountBreakdown(amount)
      .bn.times(tokenPrice ?? 1)
      .times(showingAda ? 1 : adaPrice)
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
    adaPrice,
    isPrivacyActive,
    ignorePrivacy,
    privacyPlaceholder,
    hidePrimaryPair,
  ])

  return (
    <Text style={[styles.pairedBalanceText, textStyle]} testID="pairedTotalText">
      {price}
    </Text>
  )
}

export const BalanceError = ({textStyle}: {textStyle?: TextStyle}) => {
  const strings = useStrings()
  const styles = useStyles()
  const {currency} = useCurrencyPairing()

  return <Text style={[styles.pairedBalanceText, textStyle]}>{strings.pairedBalanceError(currency)}</Text>
}

const messages = defineMessages({
  pairedBalanceError: {
    id: 'components.txhistory.balancebanner.pairedbalance.error',
    defaultMessage: '!!!Error obtaining {currency} pairing',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    pairedBalanceError: (currency: CurrencySymbol) => intl.formatMessage(messages.pairedBalanceError, {currency}),
  }
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    pairedBalanceText: {
      color: color.text_gray_medium,
      ...atoms.body_3_sm_regular,
    },
  })

  return styles
}
