import BigNumber from 'bignumber.js'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Boundary, Spacer} from '../components'
import {Icon} from '../components/Icon'
import {useBalances, useExchangeRate} from '../hooks'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../legacy/format'
import {useSelectedWallet} from '../SelectedWallet'
import {useCurrencyContext} from '../Settings/Currency'
import {COLORS} from '../theme'
import {Amounts, Quantities} from '../yoroi-wallets/utils'

export const BalanceBanner = () => {
  const wallet = useSelectedWallet()
  const [privacyMode, setPrivacyMode] = useState(false)
  const strings = useStrings()

  return (
    <View style={styles.banner}>
      <Spacer height={14} />

      <Row>
        <Icon.WalletAccount style={styles.walletIcon} iconSeed={wallet.checksum.ImagePart} scalePx={7} />
      </Row>

      <Spacer height={10} />

      <TouchableOpacity onPress={() => setPrivacyMode(!privacyMode)} style={styles.button}>
        <Row>
          <Boundary loading={{size: 'small'}} error={{size: 'inline'}}>
            <Balance privacyMode={privacyMode} />
          </Boundary>
        </Row>

        <Row>
          <Boundary
            loading={{size: 'small'}}
            error={{
              size: 'inline',
              fallback: () => (
                <Text style={styles.pairedBalanceText} testID="pairedTotalText">
                  {strings.pairedBalanceError}
                </Text>
              ),
            }}
          >
            <PairedBalance privacyMode={privacyMode} />
          </Boundary>
        </Row>
      </TouchableOpacity>
    </View>
  )
}

const hiddenBalance = '*.******'
export const Balance = ({privacyMode}: {privacyMode: boolean}) => {
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)

  const balance = privacyMode
    ? formatTokenWithTextWhenHidden(hiddenBalance, wallet.primaryToken)
    : formatTokenWithText(
        new BigNumber(Amounts.getAmount(balances, wallet.primaryToken.identifier).quantity),
        wallet.primaryToken,
      )

  return (
    <Row>
      <Text style={styles.balanceText} testID="balanceText">
        {balance}
      </Text>
    </Row>
  )
}

export const Row = ({children}: {children: React.ReactNode}) => <View style={styles.centered}>{children}</View>

const hiddenPairedTotal = '*.**'
export const PairedBalance = ({privacyMode}: {privacyMode: boolean}) => {
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)
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

  const primaryAmount = Amounts.getAmount(balances, '')
  const primaryExchangeQuantity = Quantities.quotient(
    primaryAmount.quantity,
    `${10 ** wallet.primaryToken.metadata.numberOfDecimals}`,
  )
  const secondaryExchangeQuantity = Quantities.decimalPlaces(
    Quantities.product([primaryExchangeQuantity, `${rate}`]),
    config.decimals,
  )
  const pairedTotal = privacyMode ? hiddenPairedTotal : secondaryExchangeQuantity

  return (
    <Text style={styles.pairedBalanceText} testID="pairedTotalText">
      {pairedTotal} {currency}
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
  const {currency} = useCurrencyContext()

  return {
    pairedBalanceError: intl.formatMessage(messages.pairedBalanceError, {currency}),
  }
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  walletIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  button: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Rubik-Medium',
    color: COLORS.ERROR_TEXT_COLOR_DARK,
  },
  pairedBalanceText: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: 'Rubik-Regular',
    color: COLORS.TEXT_INPUT,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
