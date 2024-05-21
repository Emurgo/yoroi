import {amountBreakdown} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, TextStyle} from 'react-native'

import {useCurrencyContext} from '../../features/Settings/Currency'
import {usePrivacyMode} from '../../features/Settings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../features/WalletManager/context/SelectedWalletContext'
import {useExchangeRate} from '../../yoroi-wallets/hooks'
import {CurrencySymbol} from '../../yoroi-wallets/types'
import {Boundary, ResetError, ResetErrorRef} from '..'

type Props = {
  amount: Portfolio.Token.Amount
  ignorePrivacy?: boolean
  textStyle?: TextStyle
}
export const PairedBalance = React.forwardRef<ResetErrorRef, Props>(({amount, textStyle, ignorePrivacy}, ref) => {
  const {currency} = useCurrencyContext()

  // hide pairing when set to the primary token
  if (currency === 'ADA') return null

  return (
    <Boundary
      key={currency}
      loading={{size: 'small'}}
      error={{
        fallback: ({resetErrorBoundary}) => (
          <ResetError resetErrorBoundary={resetErrorBoundary} ref={ref}>
            <BalanceError textStyle={textStyle} />
          </ResetError>
        ),
      }}
    >
      <Price ignorePrivacy={ignorePrivacy} amount={amount} textStyle={textStyle} />
    </Boundary>
  )
})

const Price = ({amount, textStyle, ignorePrivacy}: Props) => {
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const {isPrivacyOff, privacyPlaceholder} = usePrivacyMode()
  const {currency, config} = useCurrencyContext()
  const rate = useExchangeRate({wallet, to: currency})

  const price = React.useMemo(() => {
    if (rate == null) return `... ${currency}`

    return isPrivacyOff || ignorePrivacy
      ? `${amountBreakdown(amount).bn.times(rate).toFormat(config.decimals)} ${currency}`
      : `${privacyPlaceholder} ${currency}`
  }, [amount, config.decimals, currency, ignorePrivacy, isPrivacyOff, privacyPlaceholder, rate])

  return (
    <Text style={[styles.pairedBalanceText, textStyle]} testID="pairedTotalText">
      {price}
    </Text>
  )
}

const BalanceError = ({textStyle}: {textStyle?: TextStyle}) => {
  const strings = useStrings()
  const styles = useStyles()
  const {currency} = useCurrencyContext()

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
