// @flow

import React from 'react'
import {withHandlers} from 'recompose'
import {View, TouchableOpacity, Image} from 'react-native'

import {Text} from '../UiKit'

import styles from './styles/LanguageListItem.style'

import type {ComponentType} from 'react'

const LanguageListItem = ({
  label,
  handleSelectLanguage,
  iconSource,
  isSelected,
}) => (
  <TouchableOpacity activeOpacity={0.5} onPress={handleSelectLanguage}>
    <View style={[styles.container, isSelected && styles.active]}>
      <Image source={iconSource} style={styles.icon} />
      <Text>{label}</Text>
    </View>
  </TouchableOpacity>
)

type ExternalProps = {
  label: string,
  selectLanguage: (code: string) => void,
  iconSource: mixed,
  isSelected: boolean,
  languageCode: string,
}

export default (withHandlers({
  handleSelectLanguage: ({selectLanguage, languageCode}) => () =>
    selectLanguage(languageCode),
})(LanguageListItem): ComponentType<ExternalProps>)
