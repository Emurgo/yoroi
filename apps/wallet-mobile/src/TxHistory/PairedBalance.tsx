import { Balance } from '@yoroi/types'
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { StyleSheet, Text } from 'react-native'
import { PrivacyMode } from 'src/Settings/PrivacyMode/PrivacyMode'

import { Boundary, ResetError, ResetErrorRef } from '../components'
import { useSelectedWallet } from '../SelectedWallet'
import { useCurrencyContext } from '../Settings/Currency'
import { COLORS } from '../theme'
import { useExchangeRate } from '../yoroi-wallets/hooks'
import { CurrencySymbol } from '../yoroi-wallets/types'
import { Quantities } from '../yoroi-wallets/utils'

type Props = {
  privacyMode?: PrivacyMode
  amount: Balance.Amount
}
export const PairedBalance = React.forwardRef<ResetErrorRef, Props>(({privacyMode, amount}, ref) => {
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
      <PairedAmount privacyMode={privacyMode} amount={amount} />
    </Boundary>
  )
})

const hiddenPairedTotal = '*.**'
const PairedAmount = ({privacyMode, amount}: Props) => {
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
  const pairedTotal = privacyMode === 'HIDDEN' ? hiddenPairedTotal : secondaryExchangeQuantity
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
