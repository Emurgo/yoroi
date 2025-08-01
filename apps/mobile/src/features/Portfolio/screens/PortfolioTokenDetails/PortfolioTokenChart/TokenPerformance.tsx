import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'

import {formatPriceChange} from '~/features/Portfolio/common/helpers/priceChange'
import {TokenChartInterval} from '~/features/Portfolio/common/hooks/useGetPortfolioTokenChart'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useCurrencyPairing} from '~/features/Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {PnlTag} from '~/ui/PnlTag/PnlTag'
import {Text} from '~/ui/Text/Text'
import {Tooltip} from '~/ui/Tooltip/Tooltip'

type Props = {
  tokenPerformance?: {
    changePercent: number
    changeValue: number
    value: number
  }
  timeInterval?: TokenChartInterval
}

export const TokenPerformance = ({tokenPerformance, timeInterval}: Props) => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const {currency, config} = useCurrencyPairing()

  const variant = React.useMemo(() => {
    if (!tokenPerformance) return 'neutral'
    if (Number(tokenPerformance.changePercent) > 0) return 'success'
    if (Number(tokenPerformance.changePercent) < 0) return 'danger'

    return 'neutral'
  }, [tokenPerformance])

  const intervalLabel = React.useMemo(() => {
    switch (timeInterval) {
      case TokenChartInterval.DAY:
        return strings.portfolio._24_hours
      case TokenChartInterval.WEEK:
        return strings.portfolio._1_week
      case TokenChartInterval.MONTH:
        return strings.portfolio._1_month
      case TokenChartInterval.SIX_MONTHS:
        return strings.portfolio._6_months
      case TokenChartInterval.YEAR:
        return strings.portfolio._1_year
      case TokenChartInterval.ALL:
        return strings.portfolio.all_time
      default:
        return strings.portfolio._24_hours
    }
  }, [strings, timeInterval])

  return (
    <View style={[a.flex_row, a.justify_between, a.align_center]}>
      <Tooltip
        numberOfLine={3}
        title={
          !tokenPerformance
            ? strings.portfolio.noDataFound
            : strings.portfolio.tokenPriceChangeTooltip(intervalLabel)
        }
      >
        <View style={[a.flex, a.flex_row, a.align_center, {gap: 2}]}>
          <PnlTag withIcon={variant !== 'neutral'} variant={variant}>
            {!tokenPerformance
              ? '—'
              : formatPriceChange(tokenPerformance.changePercent)}
            %
          </PnlTag>

          <PnlTag variant={variant}>{`${
            !tokenPerformance
              ? '—'
              : formatPriceChange(tokenPerformance.changeValue, config.decimals)
          } ${currency}`}</PnlTag>
        </View>
      </Tooltip>

      <View style={[a.flex_row, a.gap_2xs, a.align_baseline]}>
        {!tokenPerformance ? (
          <Text style={[a.body_3_sm_regular, {color: p.gray_max}]}>—</Text>
        ) : (
          <>
            <Text
              style={[a.body_1_lg_medium, a.font_semibold, {color: p.gray_max}]}
            >
              {formatPriceChange(tokenPerformance.value, config.decimals)}
            </Text>

            <Text style={[a.body_3_sm_regular, {color: p.gray_max}]}>
              {currency}
            </Text>
          </>
        )}
      </View>
    </View>
  )
}
