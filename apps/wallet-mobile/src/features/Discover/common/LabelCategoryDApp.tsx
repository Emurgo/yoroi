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
    <LinearGradient
      style={styles.labelGradientBox}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      colors={colors.gradientColor}
    >
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
      borderRadius: 999,
      ...atoms.p_2xs,
    },
    labelContainer: {
      backgroundColor: color.white_static,
      ...atoms.px_xs,
      paddingVertical: 3,
      borderRadius: 999,
    },
    labelText: {
      ...atoms.body_3_sm_medium,
      color: color.primary_c600,
    },
  })

  const colors = {
    gradientColor: color.bg_gradient_1,
  }
  return {styles, colors} as const
}
