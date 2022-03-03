import React from 'react'
import {Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View} from 'react-native'

import {Text} from '../Text'

type Props = {
  label: string
  selectLanguage: (code: string) => void
  iconSource: ImageSourcePropType
  isSelected: boolean
  languageCode: string
}

export const LanguageListItem = ({label, iconSource, isSelected, selectLanguage, languageCode}: Props) => {
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    paddingVertical: 12,
    paddingHorizontal: 24,
    opacity: 0.4,
  },
  icon: {
    marginRight: 12,
  },
  active: {
    opacity: 1,
  },
})
