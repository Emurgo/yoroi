import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text} from 'react-native'

import {Boundary, ResetError, ResetErrorRef} from '../components'
import {useExchangeRate} from '../hooks'
import {useSelectedWallet} from '../SelectedWallet'
import {useCurrencyContext} from '../Settings/Currency'
import {COLORS} from '../theme'
import {CurrencySymbol, YoroiAmount} from '../yoroi-wallets/types'
import {Quantities} from '../yoroi-wallets/utils'

type Props = {
  privacyMode: boolean
  primaryAmount: YoroiAmount
}
export const PairedBalance = React.forwardRef<ResetErrorRef, Props>(({privacyMode, primaryAmount}, ref) => {
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
      <Balance privacyMode={privacyMode} primaryAmount={primaryAmount} />
    </Boundary>
  )
})

const hiddenPairedTotal = '*.**'
const Balance = ({privacyMode, primaryAmount}: Props) => {
  const wallet = useSelectedWallet()
  const {currency, config} = useCurrencyContext()
  const rate = useExchangeRate({wallet, to: currency})

  // hide pairing when set to the default asset ticker
  if (currency === 'ADA') return null

  if (rate == null)
    return (
      <Text style={styles.pairedBalanceText} testID="pairedTotalText">
        ... {currency}
      </Text>
    )

  const primaryExchangeQuantity = Quantities.quotient(
    primaryAmount.quantity,
    `${10 ** wallet.primaryToken.metadata.numberOfDecimals}`,
  )
  const secondaryExchangeQuantity = Quantities.decimalPlaces(
    Quantities.product([primaryExchangeQuantity, `${rate}`]),
    config.decimals,
  )
  const pairedTotal = privacyMode ? hiddenPairedTotal : secondaryExchangeQuantity
  const text = `${pairedTotal} ${currency}`
  return (
    <Text style={styles.pairedBalanceText} testID="pairedTotalText">
      {text}
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
