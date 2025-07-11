import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

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
  const {color} = useTheme()

  return (
    <View
      style={[
        styles.labelContainer,
        {backgroundColor: color.bg_color_max},
        {borderColor: color.el_primary_medium},
      ]}
    >
      <Text style={[styles.labelText, {color: color.primary_600}]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  labelContainer: {
    borderRadius: 20,
    paddingVertical: 1,
    paddingHorizontal: 6,
    height: 24,
    borderWidth: 2,
    ...a.flex_row,
    ...a.align_center,
    ...a.justify_center,
  },
  labelText: {
    ...a.body_3_sm_medium,
  },
})