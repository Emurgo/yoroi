import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View, ViewProps} from 'react-native'

import {Spacer} from '../../../../components/Spacer/Spacer'
import {COLORS} from '../../../../theme'

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

  return (
    <View style={[styles.root, style]} {...props}>
      {labels.map((label, index) => (
        <>
          {index > 0 && <Spacer width={8} />}

          <TouchableOpacity
            onPress={() => {
              setSelected(index)
              onSelect(index, label)
            }}
            style={[styles.button, index === selected && styles.selected]}
          >
            <Text style={styles.label}>{label}</Text>
          </TouchableOpacity>
        </>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selected: {
    backgroundColor: COLORS.BORDER_GRAY,
  },
  label: {
    color: COLORS.BLACK,
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
    lineHeight: 24,
    fontSize: 16,
  },
})
