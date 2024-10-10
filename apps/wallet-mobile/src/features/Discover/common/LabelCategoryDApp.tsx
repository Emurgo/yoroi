import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useMappedStrings} from './useStrings'

type Props = {
  category: string
}
export const LabelCategoryDApp = ({category}: Props) => {
  const {styles} = useStyles()
  const mappedStrings = useMappedStrings()
  const text = React.useMemo(() => mappedStrings(category) ?? category, [mappedStrings, category])

  return (
    <View style={styles.labelContainer}>
      <Text style={styles.labelText}>{text}</Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    labelContainer: {
      borderRadius: 20,
      backgroundColor: color.bg_color_max,
      paddingVertical: 1,
      paddingHorizontal: 6,
      height: 24,
      borderWidth: 2,
      borderColor: color.el_primary_medium,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    labelText: {
      ...atoms.body_3_sm_medium,
      color: color.primary_600,
    },
  })

  return {styles} as const
}
