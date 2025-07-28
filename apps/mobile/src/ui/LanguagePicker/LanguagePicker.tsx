import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {FlatList, TouchableOpacity, View, ViewProps} from 'react-native'

import {useSearch, useSearchOnNavBar} from '~/features/Search/SearchContext'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {LanguagePickerWarning} from '~/LanguagePickerWarning/LanguagePickerWarning'
import {Icon} from '~/ui/Icon'
import {Text} from '~/ui/Text/Text'

const INCLUDED_LANGUAGE_CODES = ['en-US', 'ja-JP']

export const LanguagePicker = () => {
  const {palette: p} = useTheme()
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
    <View style={[a.flex_1, a.align_stretch]}>
      <FlatList
        data={filteredLanguages}
        contentContainerStyle={[a.p_lg, a.align_stretch]}
        renderItem={({item: {label, code}}) => (
          <TouchableOpacity
            style={[a.py_lg, a.flex_row, a.align_center, a.justify_between]}
            onPress={() => selectLanguageCode(code)}
            testID={`languageSelect_${code}`}
          >
            <Text style={[a.body_1_lg_medium, {color: p.gray_900}]}>
              {label}
            </Text>

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
  return <View {...props} style={[{height: 1, backgroundColor: p.gray_200}]} />
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
