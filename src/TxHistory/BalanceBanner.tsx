import React, {useState} from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {useSelector} from 'react-redux'

import {Boundary, Spacer} from '../components'
import {Icon} from '../components/Icon'
import {useExchangeRate} from '../hooks'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../legacy/format'
import {availableAssetsSelector, tokenBalanceSelector} from '../legacy/selectors'
import {useSelectedWallet} from '../SelectedWallet'
import {useCurrencyContext} from '../Settings/Currency'
import {COLORS} from '../theme'

export const BalanceBanner = () => {
  const wallet = useSelectedWallet()

  const [privacyMode, setPrivacyMode] = useState(false)

  return (
    <View style={styles.banner}>
      <Spacer height={14} />

      <Row>
        <Icon.WalletAccount style={styles.walletIcon} iconSeed={wallet.checksum.ImagePart} scalePx={7} />
      </Row>

      <Spacer height={10} />

      <TouchableOpacity onPress={() => setPrivacyMode(!privacyMode)} style={styles.button}>
        <Row>
          <Balance privacyMode={privacyMode} />
        </Row>
        <Row>
          <Boundary loading={{fallbackProps: {size: 'small'}}}>
            <PairedBalance privacyMode={privacyMode} />
          </Boundary>
        </Row>
      </TouchableOpacity>
    </View>
  )
}

const hiddenBalance = '*.******'
const Balance = ({privacyMode}: {privacyMode: boolean}) => {
  const availableAssets = useSelector(availableAssetsSelector)
  const tokenBalance = useSelector(tokenBalanceSelector)
  const token = availableAssets[tokenBalance.getDefaultId()]

  const balance = privacyMode
    ? formatTokenWithTextWhenHidden(hiddenBalance, token)
    : formatTokenWithText(tokenBalance.getDefault(), token)

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
const PairedBalance = ({privacyMode}: {privacyMode: boolean}) => {
  const wallet = useSelectedWallet()
  const tokenBalance = useSelector(tokenBalanceSelector)
  const {currency, config} = useCurrencyContext()
  const rate = useExchangeRate({wallet, to: currency})

  // hide pairing when set to the default asset ticker
  if (currency === 'ADA') return null

  const balance = tokenBalance?.getDefault().dividedBy(10e5)
  const total = rate != null ? balance?.times(rate).decimalPlaces(config.decimals).toString() : '...'

  const pairedTotal = privacyMode ? hiddenPairedTotal : total

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
