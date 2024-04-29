import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View, ViewProps} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Spacer} from '../../../../components/Spacer/Spacer'

type ButtonGroupProps<T> = {
  labels: T[]
  onSelect: (index: number, label: T) => void
  initial?: number
}

export const ButtonGroup = <T extends string>({
  initial,
  labels,
  onSelect,
  style,
  ...props
}: ButtonGroupProps<T> & ViewProps) => {
  const [selected, setSelected] = React.useState(initial)
  const {styles, colors} = useStyles()

  return (
    <View style={[styles.root, style]} {...props}>
      {labels.map((label, index) => (
        <>
          {index > 0 && <Spacer width={8} />}

          <LinearGradient style={styles.gradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={colors.gradientColor}>
            <TouchableOpacity
              onPress={() => {
                setSelected(index)
                onSelect(index, label)
              }}
              style={[styles.button, index !== selected && styles.selected]}
            >
              <Text style={styles.label}>{label}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </>
      ))}
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography, padding} = theme
  const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
    },
    button: {
      ...atoms.p_sm,
      borderRadius: 6,
    },
    selected: {
      backgroundColor: color.gray_cmin,
    },
    label: {
      color: color.primary_c600,
      ...atoms.body_1_lg_medium,
    },
    gradient: {borderRadius: 8, padding: 3},
  })

  const colors = {
    gradientColor: color.gradients.light,
  }

  return {colors, styles}
}
