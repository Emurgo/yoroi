// @flow
import React from 'react'
import {View, FlatList} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'
import Markdown from 'react-native-easy-markdown'

import styles from './styles/LanguagePicker.style'
import koreanFlagIcon from '../../assets/img/flags/korean.png'
import japaneseFlagIcon from '../../assets/img/flags/japanese.png'
import russianFlagIcon from '../../assets/img/flags/russian.png'
import englishFlagIcon from '../../assets/img/flags/english.png'
import chineseFlagIcon from '../../assets/img/flags/chinese.png'
import spanishFlagIcon from '../../assets/img/flags/spanish.png'
import indonesianFlagIcon from '../../assets/img/flags/indonesian.png'
import brazilianFlagIcon from '../../assets/img/flags/brazilian.png'
import germanFlagIcon from '../../assets/img/flags/german.png'
import frenchFlagIcon from '../../assets/img/flags/french.png'
import italianFlagIcon from '../../assets/img/flags/italian.png'
import LanguageListItem from './LanguageListItem'
import {LANGUAGES} from '../../i18n/languages'
import {Button, StatusBar} from '../UiKit'

const messages = defineMessages({
  english: {
    id: 'components.common.languagepicker.english',
    defaultMessage: 'English',
    description: 'some desc',
  },
  japanese: {
    id: 'components.common.languagepicker.japanese',
    defaultMessage: '日本語',
    description: 'some desc',
  },
  korean: {
    id: 'components.common.languagepicker.korean',
    defaultMessage: '한국어',
    description: 'some desc',
  },
  russian: {
    id: 'components.common.languagepicker.russian',
    defaultMessage: 'Russian',
    description: 'some desc',
  },
  spanish: {
    id: 'components.common.languagepicker.spanish',
    defaultMessage: 'Spanish',
    description: 'some desc',
  },
  chinese: {
    id: 'components.common.languagepicker.chinese',
    defaultMessage: '简体中文',
    description: 'some desc',
  },
  indonesian: {
    id: 'components.common.languagepicker.indonesian',
    defaultMessage: 'Bahasa Indonesia',
    description: 'some desc',
  },
  brazilian: {
    id: 'components.common.languagepicker.brazilian',
    defaultMessage: 'Português brasileiro',
    description: 'some desc',
  },
  german: {
    id: 'components.common.languagepicker.german',
    defaultMessage: 'Deutsche',
    description: 'some desc',
  },
  french: {
    id: 'components.common.languagepicker.french',
    defaultMessage: 'Français',
    description: 'some desc',
  },
  italian: {
    id: 'components.common.languagepicker.italian',
    defaultMessage: 'Italiano',
    description: 'some desc',
  },
  continueButton: {
    id: 'components.common.languagepicker.continueButton',
    defaultMessage: '!!!Choose language',
    description: 'some desc',
  },
  acknowledgement: {
    id: 'components.common.languagepicker.acknowledgement',
    defaultMessage:
      '!!!**The selected language translation is fully provided by the community**. ' +
      'EMURGO is grateful to all those who have contributed',
    description: 'some desc',
  },
  contributors: {
    id: 'components.common.languagepicker.contributors',
    defaultMessage: '_',
    description: 'some desc',
  },
})

const supportedLanguages = (intl) => {
  return [
    {
      label: intl.formatMessage(messages.english),
      code: LANGUAGES.ENGLISH,
      icon: englishFlagIcon,
    },
    {
      label: intl.formatMessage(messages.japanese),
      code: LANGUAGES.JAPANESE,
      icon: japaneseFlagIcon,
    },
    {
      label: intl.formatMessage(messages.korean),
      code: LANGUAGES.KOREAN,
      icon: koreanFlagIcon,
    },
    {
      label: intl.formatMessage(messages.russian),
      code: LANGUAGES.RUSSIAN,
      icon: russianFlagIcon,
    },
    {
      label: intl.formatMessage(messages.spanish),
      code: LANGUAGES.SPANISH,
      icon: spanishFlagIcon,
    },
    {
      label: intl.formatMessage(messages.chinese),
      code: LANGUAGES.CHINESE_SIMPLIFIED,
      icon: chineseFlagIcon,
    },
    {
      label: intl.formatMessage(messages.indonesian),
      code: LANGUAGES.INDONESIAN,
      icon: indonesianFlagIcon,
    },
    {
      label: intl.formatMessage(messages.brazilian),
      code: LANGUAGES.BRAZILIAN,
      icon: brazilianFlagIcon,
    },
    {
      label: intl.formatMessage(messages.german),
      code: LANGUAGES.GERMAN,
      icon: germanFlagIcon,
    },
    {
      label: intl.formatMessage(messages.french),
      code: LANGUAGES.FRENCH,
      icon: frenchFlagIcon,
    },
    {
      label: intl.formatMessage(messages.italian),
      code: LANGUAGES.ITALIAN,
      icon: italianFlagIcon,
    },
    // TODO: Add back when chinese traditional is available
    // {
    //   label: languages.chineseTraditional,
    //   code: LANGUAGES.CHINESE_TRADITIONAL,
    //   icon: chineseFlagIcon,
    // },
  ]
}

type Props = {
  changeLanguage: (string) => any,
  handleContinue: () => mixed,
  languageCode: string,
  intl: any,
}

export const LanguagePicker = ({
  changeLanguage,
  languageCode,
  handleContinue,
  intl,
}: Props) => {
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

      {/* eslint-disable indent */
      languageCode !== 'en-US' &&
        languageCode !== 'ja-JP' && (
          <View style={styles.ackBlock}>
            {intl.formatMessage(messages.contributors) !== '_' ? (
              <Markdown>
                {`${intl.formatMessage(
                  messages.acknowledgement,
                )}: **${intl.formatMessage(messages.contributors)}**`}
              </Markdown>
            ) : (
              <Markdown>{`${intl.formatMessage(
                messages.acknowledgement,
              )}.`}</Markdown>
            )}
          </View>
        )
      /* eslint-enable indent */
      }

      <Button
        onPress={handleContinue}
        title={intl.formatMessage(messages.continueButton)}
        testID="chooseLangButton"
      />
    </View>
  )
}

export default injectIntl(LanguagePicker)
