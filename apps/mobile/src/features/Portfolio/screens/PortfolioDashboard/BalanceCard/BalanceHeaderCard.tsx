import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../../../../../components/Icon'
import {Tooltip} from '../../../../../components/Tooltip/Tooltip'
import {useStrings} from '../../../common/hooks/useStrings'
import {Rate} from './Rate'

type Props = {
  rate: number
  name: string
  hasDApps: boolean
}
export const BalanceHeaderCard = ({name, rate, hasDApps}: Props) => {
  const {styles, color} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.rowBetween}>
      {hasDApps ? (
        <Tooltip numberOfLine={3} title={strings.totalPortfolioValueTooltip}>
          <View style={styles.labelContainer}>
            <Text style={[styles.textWhite, styles.normalText]}>{strings.totalPortfolioValue}</Text>

            <Icon.InfoCircle color={color.white_static} />
          </View>
        </Tooltip>
      ) : (
        <View style={styles.labelContainer}>
          <Text style={[styles.textWhite, styles.normalText]}>{strings.totalWalletValue}</Text>
        </View>
      )}

      <Rate rate={rate} name={name} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    textWhite: {
      color: color.white_static,
    },
    normalText: {
      ...atoms.body_2_md_regular,
    },
    rowBetween: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    labelContainer: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_xs,
    },
  })

  return {styles, color} as const
}
