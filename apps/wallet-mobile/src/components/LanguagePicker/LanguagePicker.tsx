import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {FlatList, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'

import {useLanguage} from '../../i18n'
import {useSearch, useSearchOnNavBar} from '../../Search/SearchContext'
import {Icon} from '../Icon'
import {Text} from '../Text'
import {LanguagePickerWarning} from './LanguagePickerWarning'

const INCLUDED_LANGUAGE_CODES = ['en-US', 'ja-JP']

export const LanguagePicker = () => {
  const {styles, colors} = useStyles()
  const language = useLanguage()
  const {languageCode, selectLanguageCode, supportedLanguages} = language
  const strings = useStrings()

  useSearchOnNavBar({
    title: strings.languagePickerTitle,
    placeholder: strings.languagePickerSearch,
  })

  const {search} = useSearch()
  const filteredLanguages = supportedLanguages.filter(
    (lang) => lang.code.includes(search) || lang.label.includes(search),
  )

  return (
    <View style={styles.languagePicker}>
      <FlatList
        data={filteredLanguages}
        contentContainerStyle={styles.languageList}
        renderItem={({item: {label, code}}) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => selectLanguageCode(code)}
            testID={`languageSelect_${code}`}
          >
            <Text style={styles.itemText}>{label}</Text>

            {languageCode === code && <Icon.Check size={24} color={colors.iconColor} />}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <HR />}
        keyExtractor={(item) => item.code}
      />

      <LanguagePickerWarning enabled={!INCLUDED_LANGUAGE_CODES.includes(languageCode)} key={languageCode} />
    </View>
  )
}

const HR = (props: ViewProps) => {
  const {styles} = useStyles()
  return <View {...props} style={styles.hr} />
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, padding, typography} = theme

  const styles = StyleSheet.create({
    languagePicker: {
      flex: 1,
      alignItems: 'stretch',
    },
    languageList: {
      alignItems: 'stretch',
      ...padding['l'],
    },
    hr: {
      height: 1,
      backgroundColor: color.gray[200],
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...padding['y-l'],
    },
    itemText: {
      ...typography['body-1-l-medium'],
      color: color.gray[900],
    },
  })
  const colors = {
    iconColor: color.primary[600],
  }
  return {styles, colors}
}

const useStrings = () => {
  const intl = useIntl()

  return {
    languagePickerTitle: intl.formatMessage(messages.languagePickerTitle),
    languagePickerSearch: intl.formatMessage(messages.languagePickerSearch),
  }
}

const messages = defineMessages({
  languagePickerTitle: {
    id: 'global.title',
    defaultMessage: '!!!Language',
  },
  languagePickerSearch: {
    id: 'global.search',
    defaultMessage: '!!!Search',
  },
})
