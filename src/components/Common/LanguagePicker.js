// @flow
import React from 'react'
import {View, Image, FlatList} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'

import styles from './styles/LanguagePicker.style'
import koreanFlagIcon from '../../assets/img/flags/korean.png'
import japaneseFlagIcon from '../../assets/img/flags/japanese.png'
import russianFlagIcon from '../../assets/img/flags/russian.png'
import englishFlagIcon from '../../assets/img/flags/english.png'
import chineseFlagIcon from '../../assets/img/flags/chinese.png'
import spanishFlagIcon from '../../assets/img/flags/spanish.png'
import selectLanguageImage from '../../assets/img/select_language.png'
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
  continueButton: {
    id: 'components.common.languagepicker.continueButton',
    defaultMessage: '!!!Choose language',
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

      <Image source={selectLanguageImage} style={styles.image} />
      <Button
        onPress={handleContinue}
        title={intl.formatMessage(messages.continueButton)}
      />
    </View>
  )
}

export default injectIntl(LanguagePicker)
