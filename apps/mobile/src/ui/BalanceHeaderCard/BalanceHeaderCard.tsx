import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useStrings} from '../../features/Portfolio/common/hooks/useStrings'
import {Icon} from '../Icon'
import {Rate} from '../Rate/Rate'
import {Tooltip} from '../Tooltip/Tooltip'

type Props = {
  rate: number
  name: string
  hasDApps: boolean
}
export const BalanceHeaderCard = ({name, rate, hasDApps}: Props) => {
  const {color} = useTheme()
  const strings = useStrings()

  return (
    <View style={styles.rowBetween}>
      {hasDApps ? (
        <Tooltip numberOfLine={3} title={strings.totalPortfolioValueTooltip}>
          <View style={styles.labelContainer}>
            <Text style={[styles.normalText, {color: color.white_static}]}>
              {strings.totalPortfolioValue}
            </Text>

            <Icon.InfoCircle color={color.white_static} />
          </View>
        </Tooltip>
      ) : (
        <View style={styles.labelContainer}>
          <Text style={[styles.normalText, {color: color.white_static}]}>
            {strings.totalWalletValue}
          </Text>
        </View>
      )}

      <Rate rate={rate} name={name} />
    </View>
  )
}

const styles = StyleSheet.create({
  normalText: {
    ...a.body_2_md_regular,
  },
  rowBetween: {
    ...a.flex_row,
    ...a.justify_between,
    ...a.align_center,
  },
  labelContainer: {
    ...a.flex_row,
    ...a.align_center,
    ...a.gap_xs,
  },
})
