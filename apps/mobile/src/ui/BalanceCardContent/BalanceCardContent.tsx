import {amountBreakdown, amountFormatter} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {
  formatPriceChange,
  priceChange,
} from '../../features/Portfolio/common/helpers/priceChange'
import {useNavigateTo} from '../../features/Portfolio/common/hooks/useNavigateTo'
import {useCurrencyPairing} from '../../features/Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {usePrivacyMode} from '../../features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {PairedBalance} from '../PairedBalance/PairedBalance'
import {PnlTag} from '../PnlTag/PnlTag'
import {Spacer} from '../Space/Space'

type Props = {
  amount: Portfolio.Token.Amount
  headerCard: React.ReactNode
}

export const BalanceCardContent = ({amount, headerCard}: Props) => {
  const navigationTo = useNavigateTo()
  const {isPrivacyActive, setPrivacyModeOff, setPrivacyModeOn} =
    usePrivacyMode()

  const {
    ptActivity: {close, open},
    config,
  } = useCurrencyPairing()

  const {changeValue, changePercent, variantPnl} = priceChange(open, close)

  const togglePrivacyMode = () => {
    if (isPrivacyActive) {
      setPrivacyModeOn()
    } else {
      setPrivacyModeOff()
    }
  }

  return (
    <TouchableOpacity onPress={navigationTo.tokensList}>
      {headerCard}

      <Spacer height={6} />

      <View style={styles.balanceContainer}>
        <TouchableOpacity onPress={togglePrivacyMode}>
          <Balance amount={amount} />
        </TouchableOpacity>

        <View style={styles.rowBetween}>
          <TouchableOpacity
            style={styles.balanceBox}
            onPress={togglePrivacyMode}
          >
            <PairedBalance amount={amount} textStyle={styles.pairBalance} />
          </TouchableOpacity>

          <View style={styles.varyContainer}>
            <PnlPercentChange
              variantPnl={variantPnl}
              changePercent={formatPriceChange(changePercent)}
            />

            <PnlPairedChange
              variantPnl={variantPnl}
              changeValue={formatPriceChange(changeValue, config.decimals)}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

type BalanceProps = {amount: Portfolio.Token.Amount}
const Balance = ({amount}: BalanceProps) => {
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const {color} = useTheme()

  const balance = React.useMemo(
    () =>
      isPrivacyActive === false
        ? amountBreakdown(amount).bn.toFormat(2)
        : amountFormatter({template: `${privacyPlaceholder}`})(amount),
    [amount, isPrivacyActive, privacyPlaceholder],
  )

  return (
    <View style={styles.balanceBox}>
      <Text style={[styles.balanceText, {color: color.white_static}]}>
        {balance}
      </Text>

      <Text style={[styles.symbol, {color: color.white_static}]}>
        {amount.info.ticker}
      </Text>
    </View>
  )
}

type PnlPercentChangeProps = {
  variantPnl: 'danger' | 'success' | 'neutral'
  changePercent: string
}
const PnlPercentChange = ({
  variantPnl,
  changePercent,
}: PnlPercentChangeProps) => {
  return (
    <PnlTag variant={variantPnl} withIcon>
      <Text>{changePercent}%</Text>
    </PnlTag>
  )
}

type PnlPairedChangeProps = {
  variantPnl: 'danger' | 'success' | 'neutral'
  changeValue: string
}
const PnlPairedChange = ({variantPnl, changeValue}: PnlPairedChangeProps) => {
  const {currency} = useCurrencyPairing()

  return (
    <PnlTag variant={variantPnl}>
      <Text>{`${Number(changeValue) > 0 ? '+' : ''}${changeValue} ${currency}`}</Text>
    </PnlTag>
  )
}

const styles = StyleSheet.create({
  rowBetween: {
    ...a.flex_row,
    ...a.justify_between,
    ...a.align_center,
    ...a.w_full,
  },
  balanceBox: {
    ...a.flex_row,
    ...a.gap_2xs,
    ...a.align_baseline,
  },
  balanceText: {
    ...a.heading_1_medium,
    ...a.font_semibold,
  },
  symbol: {
    ...a.body_1_lg_medium,
    ...a.font_semibold,
  },
  balanceContainer: {
    ...a.gap_2xs,
    ...a.flex_col,
    ...a.align_start,
  },
  pairBalance: {
    ...a.body_2_md_regular,
  },
  varyContainer: {
    ...a.flex_row,
    ...a.gap_xs,
    ...a.align_stretch,
  },
})
