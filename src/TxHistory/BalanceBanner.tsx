import React, {useState} from 'react'
import {useIntl} from 'react-intl'
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {useSelector} from 'react-redux'

import closedEyeIcon from '../assets/img/icon/visibility-closed.png'
import openedEyeIcon from '../assets/img/icon/visibility-opened.png'
import {Spacer} from '../components'
import {Icon} from '../components/Icon'
import features from '../features'
import globalMessages from '../i18n/global-messages'
import {UI_V2} from '../legacy/config'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../legacy/format'
import {availableAssetsSelector, tokenBalanceSelector} from '../legacy/selectors'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'

const BALANCE_WHEN_HIDDEN = '*.******'
const TOTAL_WHEN_HIDDEN = '*.**'
const QUOTE_PAIR_CURRENCY = 'USD'

export const BalanceBanner = () => {
  const wallet = useSelectedWallet()

  const [privacyMode, setPrivacyMode] = useState(false)

  return (
    <View style={styles.banner}>
      <Spacer height={14} />

      {UI_V2 && (
        <View style={styles.centered}>
          <Icon.WalletAccount style={styles.walletIcon} iconSeed={wallet.checksum.ImagePart} />
        </View>
      )}

      <Spacer height={10} />

      <TouchableOpacity onPress={() => setPrivacyMode(!privacyMode)} style={styles.button}>
        <View style={styles.container}>
          <Balance privacyMode={privacyMode} />

          <View style={styles.rightSideContainer}>
            <PrivacyIndicator privacyMode={privacyMode} />
          </View>
        </View>
      </TouchableOpacity>

      <Spacer height={8} />
    </View>
  )
}

const Balance = ({privacyMode}: {privacyMode: boolean}) => {
  const intl = useIntl()

  const availableAssets = useSelector(availableAssetsSelector)
  const tokenBalance = useSelector(tokenBalanceSelector)
  const token = availableAssets[tokenBalance.getDefaultId()]

  return (
    <View style={styles.centered}>
      {!UI_V2 && <Text>{intl.formatMessage(globalMessages.availableFunds)}</Text>}
      <Text style={styles.balanceText}>
        {privacyMode
          ? formatTokenWithTextWhenHidden(BALANCE_WHEN_HIDDEN, token)
          : formatTokenWithText(tokenBalance.getDefault(), token)}
      </Text>

      {features.walletHero.fiat && (
        <Text style={styles.totalText}>
          {privacyMode ? TOTAL_WHEN_HIDDEN : '0.00'} {QUOTE_PAIR_CURRENCY}
        </Text>
      )}
    </View>
  )
}

const PrivacyIndicator = ({privacyMode}: {privacyMode: boolean}) =>
  !privacyMode ? <Image source={closedEyeIcon} /> : <Image source={openedEyeIcon} />

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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSideContainer: {
    position: 'absolute',
    right: -32,
  },
  balanceText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Rubik-Medium',
    color: COLORS.ERROR_TEXT_COLOR_DARK,
  },
  totalText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Rubik-Regular',
    color: COLORS.TEXT_INPUT,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
