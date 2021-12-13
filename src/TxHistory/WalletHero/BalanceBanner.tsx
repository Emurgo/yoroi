import React, {useState} from 'react'
import {useIntl} from 'react-intl'
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {useSelector} from 'react-redux'

import globalMessages from '../../../legacy/i18n/global-messages'
import {availableAssetsSelector, tokenBalanceSelector} from '../../../legacy/selectors'
import {COLORS} from '../../../legacy/styles/config'
import {formatTokenWithText, formatTokenWithTextWhenHidden} from '../../../legacy/utils/format'
import closedEyeIcon from '../../assets/img/icon/visibility-closed.png'
import openedEyeIcon from '../../assets/img/icon/visibility-opened.png'
import {Spacer} from '../../components'
import features from '../../features'

const BALANCE_WHEN_HIDDEN = '*.******'
const TOTAL_WHEN_HIDDEN = '*.**'
const QUOTE_PAIR_CURRENCY = 'USD'

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  // centralized: {
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
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
  // walletIcon: {
  //   height: 40,
  //   width: 40,
  //   borderRadius: 20,
  // },
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

export const BalanceBanner = () => {
  const intl = useIntl()
  const tokenBalance = useSelector(tokenBalanceSelector)
  // const walletMeta = useSelector(walletMetaSelector)
  const availableAssets = useSelector(availableAssetsSelector)
  const [showValues, setShowValues] = useState<boolean>(true)

  const token = availableAssets[tokenBalance.getDefaultId()]

  const onSwitchShowValues = () => setShowValues((state) => !state)

  return (
    <View style={styles.banner}>
      <Spacer height={16} />

      {/* <View style={styles.centralized}>
        <WalletAccountIcon style={styles.walletIcon} iconSeed={walletMeta.checksum.ImagePart} />
      </View> */}

      <Spacer height={12} />

      <TouchableOpacity onPress={onSwitchShowValues}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text>{intl.formatMessage(globalMessages.availableFunds)}</Text>
            <Text style={styles.balanceText}>
              {showValues
                ? formatTokenWithText(tokenBalance.getDefault(), token)
                : formatTokenWithTextWhenHidden(BALANCE_WHEN_HIDDEN, token)}
            </Text>
            {features.walletHero.fiat && (
              <Text style={styles.totalText}>
                {showValues ? '0.00' : TOTAL_WHEN_HIDDEN} {QUOTE_PAIR_CURRENCY}
              </Text>
            )}
          </View>
          <View style={styles.showIcon}>
            {showValues ? <Image source={closedEyeIcon} /> : <Image source={openedEyeIcon} />}
          </View>
        </View>
      </TouchableOpacity>

      <Spacer height={8} />
    </View>
  )
}
