import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {useTheme} from '../../../../theme'
import {Theme} from '../../../../theme/types'
import {OrderType} from '../RampOnOffProvider'

type ButtonActionGroupProps = {
  onSelect: (orderType: OrderType) => void
  selected: OrderType
  labels: ReadonlyArray<{label: string; value: OrderType}>
}

export const ButtonActionGroup = ({labels, onSelect, selected}: ButtonActionGroupProps) => {
  const handleOnPress = (orderType: OrderType) => onSelect(orderType)

  const {theme} = useTheme()

  const styles = React.useMemo(() => getStyles({theme: theme}), [theme])

  return (
    <View style={styles.container}>
      {labels.map((labelItem) => (
        <View key={labelItem.value} style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={() => handleOnPress(labelItem.value)}
            style={[styles.button, labelItem.value === selected && styles.selected]}
          >
            <Text style={styles.label}>{labelItem.label}</Text>
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
