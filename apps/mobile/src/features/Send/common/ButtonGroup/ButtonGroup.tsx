import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Text, TouchableOpacity, View, ViewProps} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Space} from '~/ui/Space/Space'

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
  const {palette: p} = useTheme()

  return (
    <View style={[a.flex_row, style]}>
      {labels.map((label, index) => (
        <>
          {index > 0 && <Space.Width.sm />}

          <LinearGradient
            style={[{borderRadius: 8, padding: 3}]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            colors={p.bg_gradient_1}
          >
            <TouchableOpacity
              onPress={() => {
                setSelected(index)
                onSelect(index, label)
              }}
              style={[
                a.p_sm,
                {borderRadius: 6},
                index !== selected && {backgroundColor: p.bg_color_max},
              ]}
            >
              <Text
                style={[
                  a.button_2_md,
                  {textTransform: 'none', color: p.primary_600},
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </>
      ))}
    </View>
  )
}
