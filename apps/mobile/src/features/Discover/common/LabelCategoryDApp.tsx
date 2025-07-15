import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useMappedStrings} from './useStrings'

type Props = {
  category: string
}
export const LabelCategoryDApp = ({category}: Props) => {
  const mappedStrings = useMappedStrings()
  const text = React.useMemo(
    () => mappedStrings(category) ?? category,
    [mappedStrings, category],
  )
  const {palette: p} = useTheme()

  return (
    <View
      style={[
        {
          borderRadius: 20,
          paddingVertical: 1,
          paddingHorizontal: 6,
          height: 24,
          borderWidth: 2,
        },
        a.flex_row,
        a.align_center,
        a.justify_center,
        {backgroundColor: p.bg_color_max},
        {borderColor: p.el_primary_medium},
      ]}
    >
      <Text style={[a.body_3_sm_medium, {color: p.primary_600}]}>{text}</Text>
    </View>
  )
}
