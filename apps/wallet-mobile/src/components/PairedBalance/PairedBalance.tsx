import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, TextStyle} from 'react-native'

import {useCurrencyContext} from '../../features/Settings/Currency'
import {useSelectedWallet} from '../../features/WalletManager/Context'
import {useExchangeRate} from '../../yoroi-wallets/hooks'
import {CurrencySymbol} from '../../yoroi-wallets/types'
import {Quantities} from '../../yoroi-wallets/utils'
import {Boundary, ResetError, ResetErrorRef} from '..'
import { splitBigInt } from '@yoroi/common'

type Props = {
  amount: Portfolio.Token.Amount
  privacyPlaceholder: string
  isPrivacyOff?: boolean
  textStyle?: TextStyle
}
export const PairedBalance = React.forwardRef<ResetErrorRef, Props>(({isPrivacyOff, amount, textStyle, privacyPlaceholder}, ref) => {
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
      <Price isPrivacyOff={isPrivacyOff} amount={amount} privacyPlaceholder={privacyPlaceholder} textStyle={textStyle} />
    </Boundary>
  )
})

const Price = ({isPrivacyOff, amount, textStyle, privacyPlaceholder}: Props) => {
  const wallet = useSelectedWallet()
  const styles = useStyles()
  const {currency, config} = useCurrencyContext()
  const rate = useExchangeRate({wallet, to: currency})

  // hide pairing when set to the primary token
  if (currency === 'ADA') return null

  if (rate == null)
    return (
      <Text style={[styles.pairedBalanceText, textStyle]}>
        ... {currency}
      </Text>
    )

  const price = splitBigInt()

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
    <Text style={[styles.pairedBalanceText, textStyle]}>
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
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    pairedBalanceText: {
      color: color.gray_c600,
      ...atoms.body_3_sm_regular,
    },
  })

  return styles
}
