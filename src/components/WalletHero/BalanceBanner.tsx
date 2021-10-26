import React, {memo, useCallback, useEffect, useState} from 'react'
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {useSelector} from 'react-redux'

import {availableAssetsSelector, tokenBalanceSelector, walletMetaSelector} from '../../../legacy/selectors'
import {COLORS} from '../../../legacy/styles/config'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../../../legacy/utils/format'
import closedEyeIcon from '../../assets/img/icon/visibility-closed.png'
import openedEyeIcon from '../../assets/img/icon/visibility-opened.png'
import features from '../../features'
import Spacer from '../Spacer'
import WalletAccountIcon from '../StylizedIcons/WalletAccountIcon'

const BALANCE_WHEN_HIDDEN = '*.******'
const TOTAL_WHEN_HIDDEN = '*.**'
const QUOTE_PAIR_CURRENCY = 'USD'

// NOTE: layout is following inVision spec
// https://projects.invisionapp.com/d/main?origin=v7#/console/21500065/456867605/inspect?scrollOffset=2856#project_console
const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  centralized: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'bold',
    color: COLORS.ERROR_TEXT_COLOR_DARK,
  },
  totalText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.TEXT_INPUT,
  },
  walletIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  showIcon: {
    paddingLeft: 12,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  column: {
    paddingLeft: 24,
    flexDirection: 'column',
    alignItems: 'center',
  },
})

const BalanceBanner = () => {
  const tokenBalance = useSelector(tokenBalanceSelector)
  const walletMeta = useSelector(walletMetaSelector)
  const availableAssets = useSelector(availableAssetsSelector)
  const [showValues, setShowValues] = useState<boolean>(true)
  const [balanceToShow, setBalance] = useState<string>('')
  const [totalToShow, setTotal] = useState<string>('')

  const onSwitchShowValues = useCallback(() => {
    setShowValues((state) => !state)
  }, [setShowValues])

  useEffect(() => {
    const balance = tokenBalance.getDefault()
    const token = availableAssets[tokenBalance.getDefaultId()]
    setBalance(
      showValues ? formatTokenWithText(balance, token) : formatTokenWithTextWhenHidden(BALANCE_WHEN_HIDDEN, token),
    )
    setTotal(showValues ? '0.00' : TOTAL_WHEN_HIDDEN)
  }, [showValues, tokenBalance, availableAssets])

  const fiatTotalText = features.walletHero.fiat ? `${totalToShow} ${QUOTE_PAIR_CURRENCY}` : ''

  return (
    <View style={styles.banner}>
      <Spacer height={16} />

      <View style={styles.centralized}>
        <WalletAccountIcon style={styles.walletIcon} iconSeed={walletMeta.checksum.ImagePart} />
      </View>

      <Spacer height={12} />

      <TouchableOpacity onPress={onSwitchShowValues}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.balanceText}>{balanceToShow}</Text>
            <Text style={styles.totalText}>{fiatTotalText}</Text>
          </View>
          <View style={styles.showIcon}>
            {showValues ? <Image source={closedEyeIcon} /> : <Image source={openedEyeIcon} />}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default memo(BalanceBanner)
