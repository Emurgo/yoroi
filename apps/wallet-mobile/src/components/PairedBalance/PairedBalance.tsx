import {useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, TextStyle} from 'react-native'

import {useCurrencyContext} from '../../features/Settings/Currency'
import {useSelectedWallet} from '../../SelectedWallet'
import {useExchangeRate} from '../../yoroi-wallets/hooks'
import {CurrencySymbol} from '../../yoroi-wallets/types'
import {Quantities} from '../../yoroi-wallets/utils'
import {Boundary, ResetError, ResetErrorRef} from '..'

type Props = {
  amount: Balance.Amount
  isPrivacyOff?: boolean
  textStyle?: TextStyle
}
export const PairedBalance = React.forwardRef<ResetErrorRef, Props>(({isPrivacyOff, amount, textStyle}, ref) => {
  const {currency} = useCurrencyContext()

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
      <Amount isPrivacyOff={isPrivacyOff} amount={amount} textStyle={textStyle} />
    </Boundary>
  )
})

const hiddenPairedTotal = '*.**'
const Amount = ({isPrivacyOff, amount, textStyle}: Props) => {
  const wallet = useSelectedWallet()
  const styles = useStyles()
  const {currency, config} = useCurrencyContext()
  const rate = useExchangeRate({wallet, to: currency})

  // hide pairing when set to the primary token
  if (currency === 'ADA') return null

  // hide pairing when the amount is not primary
  if (wallet.primaryTokenInfo.id !== amount.tokenId) return null

  if (rate == null)
    return (
      <Text style={[styles.pairedBalanceText, textStyle]} testID="pairedTotalText">
        ... {currency}
      </Text>
    )

  const primaryExchangeQuantity = Quantities.quotient(
    amount.quantity,
    `${10 ** wallet.primaryToken.metadata.numberOfDecimals}`,
  )
  const secondaryExchangeQuantity = Quantities.decimalPlaces(
    Quantities.product([primaryExchangeQuantity, `${rate}`]),
    config.decimals,
  )
  const pairedTotal = isPrivacyOff ? hiddenPairedTotal : secondaryExchangeQuantity
  return (
    <Text style={[styles.pairedBalanceText, textStyle]} testID="pairedTotalText">
      {`${pairedTotal} ${currency}`}
    </Text>
  )
}

const BalanceError = ({textStyle}: {textStyle?: TextStyle}) => {
  const strings = useStrings()
  const styles = useStyles()
  const {currency} = useCurrencyContext()

  return (
    <Text style={[styles.pairedBalanceText, textStyle]} testID="pairedTotalText">
      {strings.pairedBalanceError(currency)}
    </Text>
  )
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
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    pairedBalanceText: {
      fontSize: 12,
      lineHeight: 24,
      fontFamily: 'Rubik-Regular',
      color: color.gray[600],
      textAlign: 'right',
    },
  })

  return styles
}
