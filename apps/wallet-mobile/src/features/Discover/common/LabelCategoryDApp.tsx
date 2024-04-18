import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {DAppCategory, TDAppCategory} from './DAppMock'

type Props = {
  category: TDAppCategory
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
        <Text style={styles.labelText}>{DAppCategory[category] ?? ''}</Text>
      </View>
    </LinearGradient>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography, padding} = theme

  const styles = StyleSheet.create({
    labelGradientBox: {
      borderRadius: 999,
      ...padding['xxs'],
    },
    labelContainer: {
      backgroundColor: color['white-static'],
      ...padding['x-s'],
      paddingVertical: 3,
      borderRadius: 999,
    },
    labelText: {
      ...typography['body-3-s-medium'],
      color: color.primary['600'],
    },
  })

  const colors = {
    gradientColor: color.gradients['green-blue'],
  }
  return {styles, colors} as const
}
