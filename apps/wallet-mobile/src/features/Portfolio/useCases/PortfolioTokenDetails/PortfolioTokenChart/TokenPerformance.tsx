/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Icon} from '../../../../../components/Icon'
import {Text} from '../../../../../components/Text'
import {Tooltip} from '../../../../../components/Tooltip/Tooltip'
import {useCurrencyPairing} from '../../../../Settings/Currency/CurrencyContext'
import {formatPriceChange} from '../../../common/helpers/priceChange'
import {TOKEN_CHART_INTERVAL, TokenChartInterval} from '../../../common/hooks/useGetPortfolioTokenChart'
import {useStrings} from '../../../common/hooks/useStrings'
import {PnlTag} from '../../../common/PnlTag/PnlTag'

type Props = {
  tokenPerformance: {
    changePercent: number
    changeValue: number
    value: number
  }
  timeInterval?: TokenChartInterval
}

export const TokenPerformance = ({tokenPerformance, timeInterval}: Props) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {currency, config} = useCurrencyPairing()

  const variant = React.useMemo(() => {
    if (Number(tokenPerformance.changePercent) > 0) return 'success'
    if (Number(tokenPerformance.changePercent) < 0) return 'danger'

    return 'neutral'
  }, [tokenPerformance.changePercent])

  const intervalLabel = React.useMemo(() => {
    switch (timeInterval) {
      case TOKEN_CHART_INTERVAL.DAY:
        return strings._24_hours
      case TOKEN_CHART_INTERVAL.WEEK:
        return strings._1_week
      case TOKEN_CHART_INTERVAL.MONTH:
        return strings._1_month
      case TOKEN_CHART_INTERVAL.SIX_MONTHS:
        return strings._6_months
      case TOKEN_CHART_INTERVAL.YEAR:
        return strings._1_year
      case TOKEN_CHART_INTERVAL.ALL:
        return strings.all_time
      default:
        return strings._24_hours
    }
  }, [strings, timeInterval])

  return (
    <View style={styles.root}>
      <View style={styles.tokenChangeWrapper}>
        <PnlTag withIcon={variant !== 'neutral'} variant={variant}>
          {formatPriceChange(tokenPerformance.changePercent)}%
        </PnlTag>

        <PnlTag variant={variant}>{`${formatPriceChange(
          tokenPerformance.changeValue,
          config.decimals,
        )} ${currency}`}</PnlTag>

        <Tooltip numberOfLine={3} title={strings.tokenPriceChangeTooltip(intervalLabel)}>
          <Icon.InfoCircle />
        </Tooltip>
      </View>

      <View style={styles.tokenWrapper}>
        <Text style={styles.tokenPrice}>{formatPriceChange(tokenPerformance.value, config.decimals)}</Text>

        <Text style={styles.tokenPriceSymbol}>{currency}</Text>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    tokenWrapper: {
      ...atoms.flex_row,
      ...atoms.gap_2xs,
      ...atoms.align_baseline,
    },

    tokenChangeWrapper: {
      ...atoms.flex,
      ...atoms.flex_row,
      ...atoms.align_center,
      gap: 2,
    },
    tokenPrice: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
      color: color.gray_max,
    },
    tokenPriceSymbol: {
      ...atoms.body_3_sm_regular,
      color: color.gray_max,
    },
  })

  return {styles} as const
}
