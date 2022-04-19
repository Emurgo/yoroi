import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {FlatList, StyleSheet, View} from 'react-native'
import Markdown from 'react-native-easy-markdown'

import {useLanguage} from '../../i18n'
import {LanguageListItem} from './LanguageListItem'

const INCLUDED_LANGUAGE_CODES = ['en-US', 'ja-JP']

export const LanguagePicker = () => {
  const languageContext = useLanguage()

  const {languageCode, selectLanguageCode, supportedLanguages} = languageContext
  const strings = useStrings()

  return (
    <>
      <FlatList
        contentContainerStyle={styles.contentContainer}
        data={supportedLanguages}
        keyExtractor={({code}) => code}
        renderItem={({item: {label, code, icon}}) => (
          <LanguageListItem
            label={label}
            iconSource={icon}
            selectLanguage={selectLanguageCode}
            isSelected={languageCode === code}
            languageCode={code}
          />
        )}
      />

      {!INCLUDED_LANGUAGE_CODES.includes(languageCode) && (
        <View style={styles.warning}>
          <Markdown>
            {strings.contributors !== '_' ? `${strings.warning}: **${strings.contributors}**` : `${strings.warning}.`}
          </Markdown>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  warning: {
    padding: 16,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    contributors: intl.formatMessage(messages.contributors),
    warning: intl.formatMessage(messages.warning),
  }
}

const messages = defineMessages({
  warning: {
    id: 'components.common.languagepicker.acknowledgement',
    defaultMessage:
      '!!!**The selected language translation is fully provided by the community**. ' +
      'EMURGO is grateful to all those who have contributed',
  },
  contributors: {
    id: 'components.common.languagepicker.contributors',
    defaultMessage: '_',
  },
})
