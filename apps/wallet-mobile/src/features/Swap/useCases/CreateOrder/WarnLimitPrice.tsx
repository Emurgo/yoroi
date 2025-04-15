import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../components/Spacer/Spacer'
import {useStrings} from '../../common/strings'

export const WarnLimitPrice = ({
  wantedPrice,
  marketPrice,
  tokenInTicker,
  tokenOutTicker,
}: {
  wantedPrice: string
  marketPrice: string
  tokenInTicker: string
  tokenOutTicker: string
}) => {
  const strings = useStrings()
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.description}>{strings.limitPriceWarningDescription}</Text>

        <Spacer height={16} />

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.label}>{strings.limitPriceWarningYourPrice}</Text>

            <View style={styles.textWrapper}>
              <Text style={styles.value}>{`1 ${tokenInTicker} = ${wantedPrice} ${tokenOutTicker}`}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{strings.limitPriceWarningMarketPrice}</Text>

            <View style={styles.textWrapper}>
              <Text style={styles.value}>{`1 ${tokenInTicker} = ${marketPrice} ${tokenOutTicker}`}</Text>
            </View>
          </View>
        </View>
      </View>

      <Spacer fill />
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.justify_between,
      ...atoms.flex_1,
      ...atoms.px_lg,
      ...atoms.pb_lg,
    },
    label: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
    },
    value: {
      color: color.text_gray_max,
      ...atoms.body_1_lg_regular,
      ...atoms.text_right,
    },
    textWrapper: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.justify_end,
      ...atoms.align_end,
      ...atoms.flex_wrap,
      ...atoms.gap_xs,
    },
    table: {
      ...atoms.flex_col,
      ...atoms.gap_sm,
    },
    row: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.gap_md,
    },
    description: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_medium,
    },
  })

  return styles
}
