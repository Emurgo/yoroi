import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View, ViewProps} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Spacer} from '../../../../ui/Space/Space'

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
  const {color} = useTheme()

  return (
    <View style={[styles.root, style]}>
      {labels.map((label, index) => (
        <>
          {index > 0 && <Spacer width={8} />}

          <LinearGradient
            style={[styles.gradient, {borderRadius: 8, padding: 3}]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            colors={color.bg_gradient_1}
          >
            <TouchableOpacity
              onPress={() => {
                setSelected(index)
                onSelect(index, label)
              }}
              style={[
                styles.button,
                a.p_sm,
                {borderRadius: 6},
                index !== selected && styles.selected,
                index !== selected && {backgroundColor: color.bg_color_max},
              ]}
            >
              <Text style={[styles.label, {color: color.primary_600}]}>
                {label}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
  },
  button: {},
  selected: {},
  label: {
    ...a.button_2_md,
    textTransform: 'none',
  },
  gradient: {},
})
