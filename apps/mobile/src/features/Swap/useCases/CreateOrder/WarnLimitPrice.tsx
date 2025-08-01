import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'

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
  const {palette: p} = useTheme()

  return (
    <View style={[a.justify_between, a.flex_1, a.px_lg, a.pb_lg]}>
      <View>
        <Text style={[a.body_1_lg_regular, {color: p.text_gray_medium}]}>
          {strings.limitPriceWarningDescription}
        </Text>

        <Space.Height.md />

        <View style={[a.flex_col, a.gap_sm]}>
          <View style={[a.flex_row, a.justify_between, a.gap_md]}>
            <Text style={[a.body_1_lg_regular, {color: p.text_gray_medium}]}>
              {strings.limitPriceWarningYourPrice}
            </Text>

            <View
              style={[
                a.flex_1,
                a.flex_row,
                a.justify_end,
                a.align_end,
                a.flex_wrap,
                a.gap_xs,
              ]}
            >
              <Text
                style={[a.body_1_lg_regular, {color: p.text_gray_max}]}
              >{`1 ${tokenInTicker} = ${wantedPrice} ${tokenOutTicker}`}</Text>
            </View>
          </View>

          <View style={[a.flex_row, a.justify_between, a.gap_md]}>
            <Text style={[a.body_1_lg_regular, {color: p.text_gray_medium}]}>
              {strings.limitPriceWarningMarketPrice}
            </Text>

            <View
              style={[
                a.flex_1,
                a.flex_row,
                a.justify_end,
                a.align_end,
                a.flex_wrap,
                a.gap_xs,
              ]}
            >
              <Text
                style={[a.body_1_lg_regular, {color: p.text_gray_max}]}
              >{`1 ${tokenInTicker} = ${marketPrice} ${tokenOutTicker}`}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[{flex: 1}]} />
    </View>
  )
}
