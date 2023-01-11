import React from 'react'
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native'

import {Icon} from '../Icon'

type Props = {
  placeholder: string
  onChangeText(value: string): void
  value: string
  onClearPress(): void
  onBackPress(): void
}

export const SearchBar = ({placeholder, onChangeText, value, onClearPress, onBackPress}: Props) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress}>
        <Icon.Chevron direction="left" color="#000000" />
      </TouchableOpacity>
      <TextInput autoFocus value={value} placeholder={placeholder} style={styles.input} onChangeText={onChangeText} />
      <TouchableOpacity onPress={onClearPress}>
        {value.length > 0 ? <Icon.Cross color="#000000" size={23} /> : null}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    flex: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingRight: 20,
    paddingLeft: 10,
  },
})
