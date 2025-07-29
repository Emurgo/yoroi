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
import {useCurrencyPairing} from '~/features/Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {usePrivacyMode} from '~/features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {Space} from '~/ui/Space/Space'
import {PairedBalance} from '../PairedBalance/PairedBalance'
import {PnlTag} from '../PnlTag/PnlTag'

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

      <Space.Height.xs />

      <View style={[a.gap_2xs, a.flex_col, a.align_start]}>
        <TouchableOpacity onPress={togglePrivacyMode}>
          <Balance amount={amount} />
        </TouchableOpacity>

        <View style={[a.flex_row, a.justify_between, a.align_center, a.w_full]}>
          <TouchableOpacity
            style={[a.flex_row, a.gap_2xs, a.align_baseline]}
            onPress={togglePrivacyMode}
          >
            <PairedBalance amount={amount} textStyle={[a.body_2_md_regular]} />
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
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const {palette: p} = useTheme()

  const balance = React.useMemo(
    () =>
      isPrivacyActive === false
        ? amountBreakdown(amount).bn.toFormat(2)
        : amountFormatter({template: `${privacyPlaceholder}`})(amount),
    [amount, isPrivacyActive, privacyPlaceholder],
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
