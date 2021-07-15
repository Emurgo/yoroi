// @flow

import React from 'react'
import {View, TouchableOpacity, Image} from 'react-native'

import {Text} from '../UiKit'

import styles from './styles/LanguageListItem.style'

type Props = {
  label: string,
  selectLanguage: (code: string) => void,
  iconSource: any,
  isSelected: boolean,
  languageCode: string,
}

const LanguageListItem = ({label, iconSource, isSelected, selectLanguage, languageCode}: Props) => {
  const handleSelectLanguage = () => selectLanguage(languageCode)

  return (
    <TouchableOpacity activeOpacity={0.5} onPress={handleSelectLanguage}>
      <View style={[styles.container, isSelected && styles.active]}>
        <Image source={iconSource} style={styles.icon} />
        <Text>{label}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default LanguageListItem
