import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity} from 'react-native'

type Props = {
  name: string
  isActive: boolean
  onPress: () => void
}

export const SimpleTab = ({name, onPress, isActive}: Props) => {
  const {color} = useTheme()
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {borderRadius: 8},
        isActive && {backgroundColor: color.gray_200},
      ]}
    >
      <Text style={[styles.text, {color: color.gray_max}]}>{name}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    ...a.p_sm,
  },
  text: {
    ...a.body_1_lg_medium,
  },
})
