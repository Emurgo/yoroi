import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../ui/Space/Space'
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
  const {color} = useTheme()

  return (
    <View
      style={[styles.container, a.justify_between, a.flex_1, a.px_lg, a.pb_lg]}
    >
      <View>
        <Text style={[styles.description, {color: color.text_gray_medium}]}>
          {strings.limitPriceWarningDescription}
        </Text>

        <Spacer height={16} />

        <View style={[styles.table, a.flex_col, a.gap_sm]}>
          <View style={[styles.row, a.flex_row, a.justify_between, a.gap_md]}>
            <Text style={[styles.label, {color: color.text_gray_medium}]}>
              {strings.limitPriceWarningYourPrice}
            </Text>

            <View
              style={[
                styles.textWrapper,
                a.flex_1,
                a.flex_row,
                a.justify_end,
                a.align_end,
                a.flex_wrap,
                a.gap_xs,
              ]}
            >
              <Text
                style={[styles.value, {color: color.text_gray_max}]}
              >{`1 ${tokenInTicker} = ${wantedPrice} ${tokenOutTicker}`}</Text>
            </View>
          </View>

          <View style={[styles.row, a.flex_row, a.justify_between, a.gap_md]}>
            <Text style={[styles.label, {color: color.text_gray_medium}]}>
              {strings.limitPriceWarningMarketPrice}
            </Text>

            <View
              style={[
                styles.textWrapper,
                a.flex_1,
                a.flex_row,
                a.justify_end,
                a.align_end,
                a.flex_wrap,
                a.gap_xs,
              ]}
            >
              <Text
                style={[styles.value, {color: color.text_gray_max}]}
              >{`1 ${tokenInTicker} = ${marketPrice} ${tokenOutTicker}`}</Text>
            </View>
          </View>
        </View>
      </View>

      <Spacer fill />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  label: {
    ...a.body_1_lg_regular,
  },
  value: {
    ...a.body_1_lg_regular,
  },
  textWrapper: {},
  table: {},
  row: {},
  description: {
    ...a.body_1_lg_regular,
  },
})
