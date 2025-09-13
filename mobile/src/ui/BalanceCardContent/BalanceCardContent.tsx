import {amountBreakdown, amountFormatter} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'

import * as React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

import {
  formatPriceChange,
  priceChange,
} from '~/features/Portfolio/common/helpers/priceChange'
import {useNavigateTo} from '~/features/Portfolio/common/hooks/useNavigateTo'
import {useCurrencyPairing} from '~/features/Settings/context/CurrencyProvider'
import {usePrivacyMode} from '~/features/Settings/hooks/usePrivacyMode'
import {Space} from '~/ui/Space/Space'

import {PairedBalance} from '../PairedBalance/PairedBalance'
import {PnlTag} from '../PnlTag/PnlTag'

type Props = {
  amount: Portfolio.Token.Amount
  headerCard: React.ReactNode
}

export const BalanceCardContent = ({amount, headerCard}: Props) => {
  const {palette: p} = useTheme()
  const navigationTo = useNavigateTo()
  const {toggleIsPrivacyModeEnabled} = usePrivacyMode()

  const {
    ptActivity: {close, open},
    config,
  } = useCurrencyPairing()

  const {changeValue, changePercent, variantPnl} = priceChange(open, close)

  return (
    <TouchableOpacity onPress={navigationTo.tokensList}>
      {headerCard}

      <Space.Height.xs />

      <View style={[a.gap_2xs, a.flex_col, a.align_start]}>
        <TouchableOpacity onPress={toggleIsPrivacyModeEnabled}>
          <Balance amount={amount} />
        </TouchableOpacity>

        <View style={[a.flex_row, a.justify_between, a.align_center, a.w_full]}>
          <TouchableOpacity
            style={[a.flex_row, a.gap_2xs, a.align_baseline]}
            onPress={toggleIsPrivacyModeEnabled}
          >
            <PairedBalance
              amount={amount}
              textStyle={{...a.body_2_md_regular, color: p.white_static}}
            />
          </TouchableOpacity>

          <View style={[a.flex_row, a.gap_xs, a.align_stretch]}>
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
  const {isPrivacyModeEnabled, privacyPlaceholder} = usePrivacyMode()
  const {palette: p} = useTheme()

  const balance = React.useMemo(
    () =>
      !isPrivacyModeEnabled
        ? amountBreakdown(amount).bn.toFormat(2)
        : amountFormatter({template: `${privacyPlaceholder}`})(amount),
    [amount, isPrivacyModeEnabled, privacyPlaceholder],
  )

  return (
    <View style={[a.flex_row, a.gap_2xs, a.align_baseline]}>
      <Text
        style={[a.heading_1_medium, a.font_semibold, {color: p.white_static}]}
      >
        {balance}
      </Text>

      <Text
        style={[a.body_1_lg_medium, a.font_semibold, {color: p.white_static}]}
      >
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
