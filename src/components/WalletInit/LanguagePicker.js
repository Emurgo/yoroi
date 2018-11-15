// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, Image, FlatList} from 'react-native'

import {changeLanguage} from '../../actions/language'
import styles from './styles/LanguagePicker.style'
import KoreanFlagIcon from '../../assets/img/flags/korean.png'
import JapaneseFlagIcon from '../../assets/img/flags/japanese.png'
import RussianFlagIcon from '../../assets/img/flags/russian.png'
import EnglishFlagIcon from '../../assets/img/flags/english.png'
import ChineseFlagIcon from '../../assets/img/flags/chinese.png'
import SelectLanguageImage from '../../assets/img/select_language.png'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import LanguageListItem from './LanguageListItem'
import l10n, {LANGUAGES} from '../../l10n'

import type {SubTranslation} from '../../l10n/typeHelpers'

import {Button} from '../UiKit'

const supportedLangauages = () => [
  {
    label: l10n.translations.global.language.chineseSimplified,
    code: LANGUAGES.CHINESE_SIMPLIFIED,
    icon: ChineseFlagIcon,
  },
  {
    label: l10n.translations.global.language.chineseTraditional,
    code: LANGUAGES.CHINESE_TRADITIONAL,
    icon: ChineseFlagIcon,
  },
  {
    label: l10n.translations.global.language.english,
    code: LANGUAGES.ENGLISH,
    icon: EnglishFlagIcon,
  },
  {
    label: l10n.translations.global.language.japanese,
    code: LANGUAGES.JAPANESE,
    icon: JapaneseFlagIcon,
  },
  {
    label: l10n.translations.global.language.korean,
    code: LANGUAGES.KOREAN,
    icon: KoreanFlagIcon,
  },
  {
    label: l10n.translations.global.language.russian,
    code: LANGUAGES.RUSSIAN,
    icon: RussianFlagIcon,
  },
]

const getTranslations = (state) => state.trans.LanguagePicker

type Props = {
  changeLanguage: (string) => any,
  handleContinue: () => mixed,
  languageCode: string,
  translations: SubTranslation<typeof getTranslations>,
}

const LanguagePicker = ({
  changeLanguage,
  languageCode,
  handleContinue,
  translations,
}: Props) => (
  <View style={styles.container}>
    <View>
      <FlatList
        data={supportedLangauages()}
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
    </View>

    <View style={styles.imageContainer}>
      <Image source={SelectLanguageImage} />
    </View>

    <Button onPress={handleContinue} title={translations.continue} />
  </View>
)

export default compose(
  connect(
    (state) => ({
      languageCode: state.languageCode || 'en-US',
      translations: getTranslations(state),
    }),
    {
      changeLanguage,
    },
  ),
  withHandlers({
    handleContinue: ({navigation}) => (event) =>
      navigation.navigate(WALLET_INIT_ROUTES.INIT),
  }),
)(LanguagePicker)
