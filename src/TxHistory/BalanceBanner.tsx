import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {useSelector} from 'react-redux'

import {Boundary, Spacer} from '../components'
import {Icon} from '../components/Icon'
import {useExchangeRate} from '../hooks'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../legacy/format'
import {availableAssetsSelector, tokenBalanceSelector} from '../legacy/selectors'
import {useSelectedWallet} from '../SelectedWallet'
import {useCurrencyContext} from '../Settings/Currency'
import {usePrivacyMode} from '../Settings/PrivacyMode/PrivacyMode'
import {COLORS} from '../theme'

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
        <Balance />
      </Row>
      <Row>
        <Boundary loading={{fallbackProps: {size: 'small'}}}>
          <PairedBalance />
        </Boundary>
      </Row>
    </View>
  )
}

const hiddenBalance = '*.******'
const Balance = () => {
  const {privacyMode} = usePrivacyMode()
  const availableAssets = useSelector(availableAssetsSelector)
  const tokenBalance = useSelector(tokenBalanceSelector)
  const token = availableAssets[tokenBalance.getDefaultId()]

  const balance =
    privacyMode === 'HIDDEN'
      ? formatTokenWithTextWhenHidden(hiddenBalance, token)
      : formatTokenWithText(tokenBalance.getDefault(), token)

  return (
    <Row>
      <Text style={styles.balanceText}>{balance}</Text>
    </Row>
  )
}

const Row = ({children}: {children: React.ReactNode}) => <View style={styles.centered}>{children}</View>

const hiddenPairedTotal = '*.**'
const PairedBalance = () => {
  const {privacyMode} = usePrivacyMode()
  const wallet = useSelectedWallet()
  const tokenBalance = useSelector(tokenBalanceSelector)
  const {currency, config} = useCurrencyContext()
  const rate = useExchangeRate({wallet, to: currency})

  // hide pairing when set to the default asset ticker
  if (currency === 'ADA') return null

  const balance = tokenBalance?.getDefault().dividedBy(10e5)
  const total = rate && balance ? balance.times(rate).decimalPlaces(config.decimals).toString() : '...'

  const pairedTotal = privacyMode === 'HIDDEN' ? hiddenPairedTotal : total

  return (
    <Text style={styles.totalText}>
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
