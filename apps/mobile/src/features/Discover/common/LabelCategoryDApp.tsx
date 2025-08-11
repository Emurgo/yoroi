import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'

type Props = {
  category: string
}
export const LabelCategoryDApp = ({category}: Props) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const text = React.useMemo(
    () => strings.useMappedStrings()(category) ?? category,
    [strings, category],
  )

  return (
    <View
      style={[
        a.flex_row,
        a.align_center,
        a.justify_center,
        ta.bg_color_max,
        {borderColor: p.el_primary_medium},
        {
          borderRadius: 20,
          paddingVertical: 1,
          paddingHorizontal: 6,
          height: 24,
          borderWidth: 2,
        },
      ]}
    >
      <Text style={[a.body_3_sm_medium, {color: p.primary_600}]}>{text}</Text>
    </View>
  )
}
