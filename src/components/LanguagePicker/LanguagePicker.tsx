import React from 'react'
import {defineMessages, IntlShape, useIntl} from 'react-intl'
import {FlatList, StyleSheet, View} from 'react-native'
import Markdown from 'react-native-easy-markdown'

import {LANGUAGES} from '../../../legacy/i18n/languages'
import {Button} from '../Button'
import {StatusBar} from '../StatusBar'
import * as Flags from './flags'
import {LanguageListItem} from './LanguageListItem'

type Props = {
  changeLanguage: (string) => void
  handleContinue: () => void
  languageCode: string
}

export const LanguagePicker = ({changeLanguage, languageCode, handleContinue}: Props) => {
  const intl = useIntl()

  return (
    <View style={styles.container}>
      <StatusBar type="light" />

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContainer}
        data={supportedLanguages(intl)}
        keyExtractor={({code}) => code}
        extraData={languageCode}
        renderItem={({item: {label, code, icon}}) => (
          <LanguageListItem
            label={label}
            iconSource={icon}
            selectLanguage={changeLanguage}
            isSelected={languageCode === code}
            languageCode={code}
          />
        )}
      />

      {languageCode !== 'en-US' && languageCode !== 'ja-JP' && (
        <View style={styles.ackBlock}>
          {intl.formatMessage(messages.contributors) !== '_' ? (
            <Markdown>
              {`${intl.formatMessage(messages.acknowledgement)}: **${intl.formatMessage(messages.contributors)}**`}
            </Markdown>
          ) : (
            <Markdown>{`${intl.formatMessage(messages.acknowledgement)}.`}</Markdown>
          )}
        </View>
      )}

      <Button onPress={handleContinue} title={intl.formatMessage(messages.continueButton)} testID="chooseLangButton" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ackBlock: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 40,
  },
})

const messages = defineMessages({
  english: {
    id: 'components.common.languagepicker.english',
    defaultMessage: 'English',
  },
  japanese: {
    id: 'components.common.languagepicker.japanese',
    defaultMessage: '日本語',
  },
  korean: {
    id: 'components.common.languagepicker.korean',
    defaultMessage: '한국어',
  },
  russian: {
    id: 'components.common.languagepicker.russian',
    defaultMessage: 'Русский',
  },
  spanish: {
    id: 'components.common.languagepicker.spanish',
    defaultMessage: 'Español',
  },
  chinese: {
    id: 'components.common.languagepicker.chinese',
    defaultMessage: '简体中文',
  },
  indonesian: {
    id: 'components.common.languagepicker.indonesian',
    defaultMessage: 'Bahasa Indonesia',
  },
  brazilian: {
    id: 'components.common.languagepicker.brazilian',
    defaultMessage: 'Português brasileiro',
  },
  german: {
    id: 'components.common.languagepicker.german',
    defaultMessage: 'Deutsch',
  },
  french: {
    id: 'components.common.languagepicker.french',
    defaultMessage: 'Français',
  },
  italian: {
    id: 'components.common.languagepicker.italian',
    defaultMessage: 'Italiano',
  },
  dutch: {
    id: 'components.common.languagepicker.dutch',
    defaultMessage: 'Nederlands',
  },
  czech: {
    id: 'components.common.languagepicker.czech',
    defaultMessage: 'Čeština',
  },
  hungarian: {
    id: 'components.common.languagepicker.hungarian',
    defaultMessage: 'Magyar',
  },
  slovak: {
    id: 'components.common.languagepicker.slovak',
    defaultMessage: 'Slovenčina',
  },
  continueButton: {
    id: 'components.common.languagepicker.continueButton',
    defaultMessage: '!!!Choose language',
  },
  acknowledgement: {
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

const supportedLanguages = (intl: IntlShape) => {
  return [
    {
      label: intl.formatMessage(messages.english),
      code: LANGUAGES.ENGLISH,
      icon: Flags.English,
    },
    {
      label: intl.formatMessage(messages.japanese),
      code: LANGUAGES.JAPANESE,
      icon: Flags.Japanese,
    },
    {
      label: intl.formatMessage(messages.korean),
      code: LANGUAGES.KOREAN,
      icon: Flags.Korean,
    },
    {
      label: intl.formatMessage(messages.russian),
      code: LANGUAGES.RUSSIAN,
      icon: Flags.Russian,
    },
    {
      label: intl.formatMessage(messages.spanish),
      code: LANGUAGES.SPANISH,
      icon: Flags.Spanish,
    },
    {
      label: intl.formatMessage(messages.chinese),
      code: LANGUAGES.CHINESE_SIMPLIFIED,
      icon: Flags.Chinese,
    },
    {
      label: intl.formatMessage(messages.indonesian),
      code: LANGUAGES.INDONESIAN,
      icon: Flags.Indonesian,
    },
    {
      label: intl.formatMessage(messages.brazilian),
      code: LANGUAGES.BRAZILIAN,
      icon: Flags.Brazilian,
    },
    {
      label: intl.formatMessage(messages.german),
      code: LANGUAGES.GERMAN,
      icon: Flags.German,
    },
    {
      label: intl.formatMessage(messages.french),
      code: LANGUAGES.FRENCH,
      icon: Flags.French,
    },
    {
      label: intl.formatMessage(messages.italian),
      code: LANGUAGES.ITALIAN,
      icon: Flags.Italian,
    },
    {
      label: intl.formatMessage(messages.dutch),
      code: LANGUAGES.DUTCH,
      icon: Flags.Dutch,
    },
    {
      label: intl.formatMessage(messages.czech),
      code: LANGUAGES.CZECH,
      icon: Flags.Czech,
    },
    {
      label: intl.formatMessage(messages.hungarian),
      code: LANGUAGES.HUNGARIAN,
      icon: Flags.Hungarian,
    },
    {
      label: intl.formatMessage(messages.slovak),
      code: LANGUAGES.SLOVAK,
      icon: Flags.Slovak,
    },
    // TODO: Add back when chinese traditional is available
    // {
    //   label: languages.chineseTraditional,
    //   code: LANGUAGES.CHINESE_TRADITIONAL,
    //   icon: Flags.Chinese,
    // },
  ]
}
