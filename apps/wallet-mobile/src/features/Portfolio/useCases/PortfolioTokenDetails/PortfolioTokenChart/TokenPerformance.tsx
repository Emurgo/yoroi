/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Icon, Text} from '../../../../../components'
import {Tooltip} from '../../../../../components/Tooltip'
import {useCurrencyContext} from '../../../../Settings/Currency'
import {PnlTag} from '../../../common/PnlTag/PnlTag'
import {useStrings} from '../../../common/useStrings'

interface Props {
  changePercent?: number
  changeValue?: number
  value?: number
}

export const TokenPerformance = ({changePercent = 0, changeValue = 0, value = 0}: Props) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {currency} = useCurrencyContext()

  const variant = React.useMemo(() => {
    if (Number(changePercent) > 0) return 'success'
    if (Number(changePercent) < 0) return 'danger'

    return 'neutral'
  }, [changePercent])

  return (
    <View style={styles.root}>
      <View style={styles.tokenChangeWrapper}>
        <PnlTag withIcon={variant !== 'neutral'} variant={variant}>
          {changePercent.toFixed(2)}%
        </PnlTag>

        <PnlTag variant={variant}>{`${changeValue.toFixed(1)} ${currency}`}</PnlTag>

        <Tooltip numberOfLine={3} title={strings.tokenPriceChangeTooltip}>
          <Icon.InfoCircle />
        </Tooltip>
      </View>

      <View style={styles.tokenWrapper}>
        <Text style={styles.tokenPrice}>{value.toFixed(0)}</Text>

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
      color: color.gray_cmax,
    },
    tokenPriceSymbol: {
      ...atoms.body_3_sm_regular,
      color: color.gray_cmax,
    },
  })

  return {styles} as const
}
