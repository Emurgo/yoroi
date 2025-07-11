import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'

import {useLanguage} from '../../../kernel/i18n/LanguageProvider'
import {useSearch, useSearchOnNavBar} from '../../features/Search/SearchContext'
import {Icon} from '../Icon'
import {LanguagePickerWarning} from '../LanguagePickerWarning/LanguagePickerWarning'
import {Text} from '../Text/Text'

const INCLUDED_LANGUAGE_CODES = ['en-US', 'ja-JP']

export const LanguagePicker = () => {
  const {color} = useTheme()
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
        contentContainerStyle={[styles.languageList, a.p_lg]}
        renderItem={({item: {label, code}}) => (
          <TouchableOpacity
            style={[styles.item, a.py_lg]}
            onPress={() => selectLanguageCode(code)}
            testID={`languageSelect_${code}`}
          >
            <Text style={[styles.itemText, {color: color.gray_900}]}>
              {label}
            </Text>

            {languageCode === code && (
              <Icon.Check size={24} color={color.primary_600} />
            )}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <HR />}
        keyExtractor={(item) => item.code}
      />

      <LanguagePickerWarning
        enabled={!INCLUDED_LANGUAGE_CODES.includes(languageCode)}
        key={languageCode}
      />
    </View>
  )
}

const HR = (props: ViewProps) => {
  const {color} = useTheme()
  return (
    <View {...props} style={[styles.hr, {backgroundColor: color.gray_200}]} />
  )
}

const styles = StyleSheet.create({
  languagePicker: {
    flex: 1,
    alignItems: 'stretch',
  },
  languageList: {
    alignItems: 'stretch',
  },
  hr: {
    height: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    ...a.body_1_lg_medium,
  },
})

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
