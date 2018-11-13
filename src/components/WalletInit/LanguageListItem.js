// @flow

import React from 'react'
import {withHandlers} from 'recompose'
import {View, TouchableHighlight, Image} from 'react-native'

import {Text} from '../UiKit'

import styles from './styles/LanguageListItem.style'

import type {ComponentType} from 'react'

const LanguageListItem = ({
  label,
  handleSelectLanguage,
  iconSource,
  isSelected,
}) => (
  <TouchableHighlight onPress={handleSelectLanguage}>
    <View style={styles.container}>
      <Image
        source={iconSource}
        style={[styles.icon, isSelected ? styles.active : styles.inactive]}
      />
      <Text
        style={[
          styles.languageName,
          isSelected ? styles.active : styles.inactive,
        ]}
      >
        {label}
      </Text>
    </View>
  </TouchableHighlight>
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
