import BigNumber from 'bignumber.js'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Boundary, Spacer} from '../components'
import {Icon} from '../components/Icon'
import {useBalances, useExchangeRate} from '../hooks'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../legacy/format'
import {useSelectedWallet} from '../SelectedWallet'
import {useCurrencyContext} from '../Settings/Currency'
import {usePrivacyMode} from '../Settings/PrivacyMode/PrivacyMode'
import {COLORS} from '../theme'
import {Amounts, Quantities} from '../yoroi-wallets/utils'

export const BalanceBanner = () => {
  const wallet = useSelectedWallet()

  return (
    <View style={styles.banner}>
      <Spacer height={14} />

      <Row>
        <Icon.WalletAccount style={styles.walletIcon} iconSeed={wallet.checksum.ImagePart} scalePx={7} />
      </Row>

      <Spacer height={10} />

      <Row>
        <Boundary loading={{size: 'small'}} error={{size: 'inline'}}>
          <Row>
            <Balance />
          </Row>

          <Row>
            <PairedBalance />
          </Row>
        </Boundary>
      </Row>
    </View>
  )
}

const hiddenBalance = '*.******'
const Balance = () => {
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)
  const {privacyMode} = usePrivacyMode()

  const balance =
    privacyMode === 'HIDDEN'
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

const Row = ({children}: {children: React.ReactNode}) => <View style={styles.centered}>{children}</View>

const hiddenPairedTotal = '*.**'
const PairedBalance = () => {
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)
  const {currency, config} = useCurrencyContext()
  const rate = useExchangeRate({wallet, to: currency})
  const {privacyMode} = usePrivacyMode()

  // hide pairing when set to the default asset ticker
  if (currency === 'ADA') return null

  if (rate == null)
    return (
      <Text style={styles.totalText} testID="pairedTotalText">
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
  const pairedTotal = privacyMode === 'HIDDEN' ? hiddenPairedTotal : secondaryExchangeQuantity

  return (
    <Text style={styles.totalText} testID="pairedTotalText">
      {pairedTotal} {currency}
    </Text>
  )
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
  balanceText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Rubik-Medium',
    color: COLORS.ERROR_TEXT_COLOR_DARK,
  },
  totalText: {
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
