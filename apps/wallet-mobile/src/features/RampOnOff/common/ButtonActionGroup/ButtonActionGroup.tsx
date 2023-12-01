import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {useTheme} from '../../../../theme'
import {Theme} from '../../../../theme/types'

interface ButtonActionGroupProps {
  onSelect: (action: string) => void
  selected: string
  labels: string[]
}

export const ButtonActionGroup: React.FC<ButtonActionGroupProps> = ({labels, onSelect, selected}) => {
  const handleOnPress = (label: string) => onSelect(label)

  const {theme} = useTheme()

  const styles = React.useMemo(() => getStyles({theme: theme}), [theme])

  return (
    <View style={styles.container}>
      {labels.map((buttonLabel) => (
        <View key={buttonLabel} style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={() => handleOnPress(buttonLabel)}
            style={[styles.button, buttonLabel === selected && styles.selected]}
          >
            <Text style={styles.label}>{buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
}

const getStyles = (props: {theme: Theme}) => {
  const {theme} = props
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
    },
    buttonWrapper: {
      paddingRight: 8,
    },
    button: {
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderRadius: 8,
    },
    selected: {
      backgroundColor: theme.color.gray[200],
    },
    label: {
      color: theme.color['black-static'],
      fontFamily: 'Rubik-Medium',
      fontWeight: '500',
      lineHeight: 24,
      fontSize: 16,
    },
  })
  return styles
}
