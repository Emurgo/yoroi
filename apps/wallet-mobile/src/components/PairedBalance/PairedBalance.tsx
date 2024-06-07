import {amountBreakdown} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, TextStyle} from 'react-native'

import {useCurrencyContext} from '../../features/Settings/Currency'
import {usePrivacyMode} from '../../features/Settings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import {useExchangeRate} from '../../yoroi-wallets/hooks'
import {CurrencySymbol} from '../../yoroi-wallets/types'
import {Boundary, ResetError, ResetErrorRef} from '..'

type Props = {
  amount: Portfolio.Token.Amount
  ignorePrivacy?: boolean
  textStyle?: TextStyle
  currency?: CurrencySymbol
  isHidePairPrimaryToken?: boolean
}
export const PairedBalance = React.forwardRef<ResetErrorRef, Props>(
  ({amount, textStyle, ignorePrivacy, currency: customCurrencySymbol, isHidePairPrimaryToken = true}, ref) => {
    const {currency} = useCurrencyContext()
    const getCurrency = customCurrencySymbol ?? currency

    // hide pairing when set to the primary token
    if (isHidePairPrimaryToken && getCurrency === 'ADA') return null

    return (
      <Boundary
        key={currency}
        loading={{size: 'small'}}
        error={{
          fallback: ({resetErrorBoundary}) => (
            <ResetError resetErrorBoundary={resetErrorBoundary} ref={ref}>
              <BalanceError textStyle={textStyle} currency={getCurrency} />
            </ResetError>
          ),
        }}
      >
        <Price currency={getCurrency} ignorePrivacy={ignorePrivacy} amount={amount} textStyle={textStyle} />
      </Boundary>
    )
  },
)

const Price = ({amount, textStyle, ignorePrivacy, currency}: Props & Required<Pick<Props, 'currency'>>) => {
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const {config} = useCurrencyContext()
  const rate = useExchangeRate({wallet, to: currency})

  const price = React.useMemo(() => {
    if (rate == null) return `... ${currency}`

    return !isPrivacyActive || ignorePrivacy === true
      ? `${amountBreakdown(amount).bn.times(rate).toFormat(config.decimals)} ${currency}`
      : `${privacyPlaceholder} ${currency}`
  }, [amount, config.decimals, currency, ignorePrivacy, isPrivacyActive, privacyPlaceholder, rate])

  return (
    <Text style={[styles.pairedBalanceText, textStyle]} testID="pairedTotalText">
      {price}
    </Text>
  )
}

const BalanceError = ({textStyle, currency}: {textStyle?: TextStyle; currency: CurrencySymbol}) => {
  const strings = useStrings()
  const styles = useStyles()

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
      color: color.gray_c600,
      ...atoms.body_3_sm_regular,
    },
  })

  return styles
}
