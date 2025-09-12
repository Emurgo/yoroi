import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {FlatList} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useSearch, useSearchOnNavBar} from '~/features/Search/SearchContext'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {
  LanguageCode,
  LanguageRecord,
  supportedLanguages,
} from '~/kernel/i18n/localization'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Hr} from '~/ui/Hr/Hr'

import {LanguageItem} from './LanguageItem'
import {LanguageWarning} from './LanguageWarning'

const translatedByYoroi: Array<LanguageCode> = ['en-US', 'ja-JP']

export const SelectLanguageScreen = () => {
  const strings = useStrings()
  const {languageCode, selectLanguage} = useLanguage()

  useSearchOnNavBar({
    title: strings.settings.languageTitle,
    placeholder: strings.initialization.languagePickerTitle,
  })

  const {search} = useSearch()
  const filteredLanguages = supportedLanguages.filter(
    (lang) => lang.code.includes(search) || lang.label.includes(search),
  ) as LanguageRecord[]

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, a.px_lg]}
    >
      <FlatList
        data={filteredLanguages}
        renderItem={({item: {label, code}}) => (
          <LanguageItem
            nativeName={label}
            code={code}
            selectLanguage={selectLanguage}
            isSelected={languageCode === code}
          />
        )}
        ItemSeparatorComponent={Hr}
        keyExtractor={(item) => item.code}
      />

      <LanguageWarning
        enabled={!translatedByYoroi.includes(languageCode)}
        key={languageCode}
      />
    </SafeAreaView>
  )
}
