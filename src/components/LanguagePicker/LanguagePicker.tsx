import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {FlatList, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import Markdown from 'react-native-easy-markdown'

import {useLanguage} from '../../i18n'
import {Icon} from '../Icon'
import {Text} from '../Text'

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

        <Warning enabled={!INCLUDED_LANGUAGE_CODES.includes(languageCode)} key={languageCode} />
      </View>
    </>
  )
}

const Row = ({style, ...props}: ViewProps) => <View {...props} style={[styles.row, style]} />
const HR = (props: ViewProps) => <View {...props} style={styles.hr} />

const Warning = ({enabled}: {enabled: boolean}) => {
  const [dismissed, setDismissed] = useState(false)
  const strings = useStrings()

  if (!enabled) return null
  if (dismissed) return null

  return (
    <View style={styles.dialog}>
      <Row style={styles.closeButtonRow}>
        <TouchableOpacity onPress={() => setDismissed(true)}>
          <Icon.Cross size={26} />
        </TouchableOpacity>
      </Row>

      <Markdown markdownStyles={{text: styles.markdownText}}>
        {strings.contributors !== '_' ? `${strings.warning}: **${strings.contributors}**` : `${strings.warning}.`}
      </Markdown>
    </View>
  )
}

const styles = StyleSheet.create({
  languagePicker: {
    flex: 1,
    position: 'relative',
    alignItems: 'stretch',
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: '#EAEDF2',
    borderRadius: 8,
    padding: 14,
  },
  closeButtonRow: {
    justifyContent: 'flex-end',
  },
  markdownText: {
    fontSize: 18,
  },
  languageList: {
    alignItems: 'stretch',
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
