import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'

import {Text} from '~/ui/Text/Text'
import {TokenChartInterval} from '~/features/Portfolio/common/hooks/useGetPortfolioTokenChart'

interface Props {
  timeInterval: TokenChartInterval
  onChange: (timeInterval: TokenChartInterval) => void
  disabled?: boolean
}
export const TokenChartToolbar = ({
  timeInterval,
  disabled,
  onChange,
}: Props) => {
  const {atoms: ta, palette: p} = useTheme()

  const handleChange = (itv: TokenChartInterval) => {
    if (disabled) return
    onChange(itv)
  }

  return (
    <View style={[a.flex_row, a.justify_between, a.align_center, {height: 30}]}>
      {Object.values(TokenChartInterval).map((itv) => (
        <TouchableOpacity
          onPress={() => handleChange(itv)}
          style={[
            a.rounded_sm,
            {padding: 6},
            itv === timeInterval ? {backgroundColor: p.primary_500} : {},
          ]}
          key={itv}
        >
          <Text
            style={[
              a.body_3_sm_medium,
              a.font_semibold,
              {color: p.gray_600, textTransform: 'uppercase'},
              itv === timeInterval ? {color: p.gray_min} : {},
            ]}
          >
            {itv}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}
