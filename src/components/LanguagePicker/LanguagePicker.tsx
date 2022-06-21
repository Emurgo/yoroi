import React from 'react'
import {FlatList, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'

import {useLanguage} from '../../i18n'
import {Icon} from '../Icon'
import {Text} from '../Text'
import {LanguagePickerWarning} from './LanguagePickerWarning'

const INCLUDED_LANGUAGE_CODES = ['en-US', 'ja-JP']

export const LanguagePicker = () => {
  const languageContext = useLanguage()
  const {languageCode, selectLanguageCode, supportedLanguages} = languageContext

  return (
    <>
      <View style={styles.languagePicker}>
        <FlatList
          data={supportedLanguages}
          contentContainerStyle={styles.languageList}
          renderItem={({item: {label, code}}) => (
            <TouchableOpacity style={styles.item} onPress={() => selectLanguageCode(code)}>
              <Text style={styles.itemText}>{label}</Text>
              {languageCode === code && <Icon.Check size={24} color="blue" />}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <HR />}
          keyExtractor={(item) => item.code}
        />

        <LanguagePickerWarning enabled={!INCLUDED_LANGUAGE_CODES.includes(languageCode)} key={languageCode} />
      </View>
    </>
  )
}

const HR = (props: ViewProps) => <View {...props} style={styles.hr} />

const styles = StyleSheet.create({
  languagePicker: {
    flex: 1,
    alignItems: 'stretch',
  },
  languageList: {
    alignItems: 'stretch',
    paddingHorizontal: 14,
  },
  hr: {
    height: 1,
    backgroundColor: '#DCE0E9',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
  itemText: {
    fontSize: 16,
  },
})
