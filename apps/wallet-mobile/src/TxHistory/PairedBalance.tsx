import {Balance as B} from '@yoroi/types'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text} from 'react-native'

import {Boundary, ResetError, ResetErrorRef} from '../components'
import {useCurrencyContext} from '../features/Settings/Currency'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'
import {useExchangeRate} from '../yoroi-wallets/hooks'
import {CurrencySymbol} from '../yoroi-wallets/types'
import {Quantities} from '../yoroi-wallets/utils'

type Props = {
  amount: B.Amount
  isPrivacyOff?: boolean
}
export const PairedBalance = React.forwardRef<ResetErrorRef, Props>(({isPrivacyOff, amount}, ref) => {
  const {currency} = useCurrencyContext()

  return (
    <Boundary
      key={currency}
      loading={{size: 'small'}}
      error={{
        fallback: ({resetErrorBoundary}) => (
          <ResetError resetErrorBoundary={resetErrorBoundary} ref={ref}>
            <BalanceError />
          </ResetError>
        ),
      }}
    >
      <Balance isPrivacyOff={isPrivacyOff} amount={amount} />
    </Boundary>
  )
})

const hiddenPairedTotal = '*.**'
const Balance = ({isPrivacyOff, amount}: Props) => {
  const wallet = useSelectedWallet()
  const {currency, config} = useCurrencyContext()
  const rate = useExchangeRate({wallet, to: currency})

  // hide pairing when set to the primary token
  if (currency === 'ADA') return null

  // hide pairing when the amount is not primary
  if (wallet.primaryTokenInfo.id !== amount.tokenId) return null

  if (rate == null)
    return (
      <Text style={styles.pairedBalanceText} testID="pairedTotalText">
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
    <Text style={styles.pairedBalanceText} testID="pairedTotalText">
      {`${pairedTotal} ${currency}`}
    </Text>
  )
}

const BalanceError = () => {
  const strings = useStrings()
  const {currency} = useCurrencyContext()

  return (
    <Text style={styles.pairedBalanceText} testID="pairedTotalText">
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

const styles = StyleSheet.create({
  pairedBalanceText: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: 'Rubik-Regular',
    color: COLORS.TEXT_INPUT,
    textAlign: 'right',
  },
})
