import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

type Props = {
  category: string
}
export const LabelCategoryDApp = ({category}: Props) => {
  const {styles} = useStyles()

  return (
    <View style={styles.labelContainer}>
      <Text style={styles.labelText}>{category}</Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    labelContainer: {
      borderRadius: 20,
      backgroundColor: color.gray_cmin,
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
      color: color.primary_c600,
    },
  })

  const colors = {
    gradientBg: ['#17D1AA', '#1ACBAF', '#21B8BC', '#2E9BD3', '#3F71F1', '#475FFF'],
  }
  return {styles, colors} as const
}
