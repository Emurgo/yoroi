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
  const styles = useStyles()

  return (
    <View style={[styles.root, style]} {...props}>
      {labels.map((label, index) => (
        <>
          {index > 0 && <Spacer width={8} />}

          <LinearGradient
            style={{borderRadius: 8, padding: 3}}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            colors={['#C6F7ED', '#E4E8F7']}
          >
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
      ...padding['s'],
      borderRadius: 6,
    },
    selected: {
      backgroundColor: color.gray.min,
    },
    label: {
      color: color.primary[600],
      ...typography['body-1-l-medium'],
    },
  })

  return styles
}
