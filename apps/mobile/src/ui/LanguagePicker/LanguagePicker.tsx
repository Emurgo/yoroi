import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {FlatList, TouchableOpacity, View, ViewProps} from 'react-native'

// import {useSearch, useSearchOnNavBar} from '../../features/Search/SearchContext'
import {useLanguage} from '../../kernel/i18n/LanguageProvider'
import {
  LanguageRecord,
  supportedLanguages,
} from '../../kernel/i18n/localization'
import {Icon} from '../Icon'
import {LanguagePickerWarning} from '../LanguagePickerWarning/LanguagePickerWarning'

const INCLUDED_LANGUAGE_CODES = ['en-US', 'ja-JP']

export const LanguagePicker = () => {
  const {palette: p} = useTheme()
  const language = useLanguage()

  const {languageCode, selectLanguage} = language
  const strings = useStrings()

  const {search} = {
    search: '',
  }
  const filteredLanguages = supportedLanguages.filter(
    (lang) => lang.code.includes(search) || lang.label.includes(search),
  ) as LanguageRecord[]

  return (
    <View style={[a.flex_1, a.align_stretch]}>
      <FlatList
        data={filteredLanguages}
        contentContainerStyle={[a.p_lg, a.align_stretch]}
        renderItem={({item: {label, code}}) => (
          <TouchableOpacity
            style={[styles.item, a.py_lg]}
            onPress={() => selectLanguage(code)}
            testID={`languageSelect_${code}`}
          >
            <Text style={[styles.itemText, {color: p.gray_900}]}>{label}</Text>

            {languageCode === code && (
              <Icon.Check size={24} color={p.primary_600} />
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
  const {palette: p} = useTheme()
  return <View {...props} style={[styles.hr, {backgroundColor: p.gray_200}]} />
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
