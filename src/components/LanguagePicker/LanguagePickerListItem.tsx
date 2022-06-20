import React from 'react'
import {StyleSheet, TouchableOpacity} from 'react-native'

import {Icon} from '../Icon'
import {Text} from '../Text'

type Props = {
  text: string
  onItemPressed: () => void
  selected: boolean
}

export const LanguagePickerListItem = ({text, onItemPressed, selected}: Props) => {
  return (
    <TouchableOpacity style={styles.item} onPress={onItemPressed}>
      <Text style={styles.title}>{text}</Text>
      {selected && <Icon.Check size={24} color="blue" />}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
  title: {
    fontSize: 16,
  },
})
