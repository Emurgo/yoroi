import React, {useState} from 'react'
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native'

import {Icon} from '../Icon'

type Props = {
  setItemToSearch: (string) => void
  text: string
  placeholderText: string
}

export const LanguagePickerListSearchInput = ({setItemToSearch, text, placeholderText}: Props) => {
  const [focused, setFocused] = useState<boolean>(false)

  return (
    <View style={styles.search}>
      <View style={styles.innerSearch}>
        <Icon.Magnify style={styles.searchIcon} size={30} color="#6B7384" />

        <TextInput
          value={text}
          onChangeText={setItemToSearch}
          style={[styles.input, focused ? styles.inputFocused : styles.inputNotFocused]}
          placeholder={placeholderText}
          placeholderTextColor="#6B7384"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {text !== '' && (
          <TouchableOpacity onPress={() => setItemToSearch('')} style={styles.crossIcon}>
            <Icon.Cross size={30} color="#6B7384" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#DCE0E9',
    borderRadius: 10,
    color: 'black',
    paddingRight: 8,
    paddingLeft: 45,
    paddingVertical: 15,
    fontSize: 17,
  },
  inputNotFocused: {
    borderColor: '#DCE0E9',
  },
  inputFocused: {
    borderColor: 'black',
  },
  search: {
    top: 0,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  innerSearch: {
    width: '100%',
    position: 'relative',
    padding: 8,
  },
  searchIcon: {
    position: 'absolute',
    top: 25,
    left: 18,
    zIndex: 1,
  },
  crossIcon: {
    position: 'absolute',
    top: 22,
    right: 18,
    zIndex: 1,
  },
})
