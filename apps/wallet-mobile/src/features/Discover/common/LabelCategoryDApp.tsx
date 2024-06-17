import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

type Props = {
  category: string
}
export const LabelCategoryDApp = ({category}: Props) => {
  const {styles, colors} = useStyles()

  return (
    <LinearGradient style={styles.labelGradientBox} start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={colors.gradientBg}>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>{category}</Text>
      </View>
    </LinearGradient>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    labelGradientBox: {
      borderRadius: 20,
      ...atoms.p_2xs,
      height: 24,
    },
    labelContainer: {
      borderRadius: 24,
      backgroundColor: color.gray_cmin,
      ...atoms.h_full,
      paddingVertical: 1,
      paddingHorizontal: 6,
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
