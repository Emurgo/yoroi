// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, Picker} from 'react-native'

import {changeLanguage} from '../../actions'
import styles from './styles/LanguagePicker.style'
import {WALLET_INIT_ROUTES} from '../../RoutesList'

import type {SubTranslation} from '../../l10n/typeHelpers'

import {Text, Button} from '../UiKit'

// TODO: l10n
const supportedLangauage = [
  {label: '简体中文', name: 'Chinese (Simplified)', code: 'zh-Hans'},
  {label: '繁體中文', name: 'Chinese (Traditional)', code: 'zh-Hant'},
  {label: 'English', name: 'English', code: 'en-US'},
  {label: '日本語', name: 'Japanese', code: 'ja-JP'},
  {label: '한국어', name: 'Korean', code: 'ko-KR'},
  {label: 'Russian', name: 'Russian', code: 'ru-RU'},
]

const getTranslations = (state) => state.trans.LanguagePicker

type Props = {
  changeLanguage: () => mixed,
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
    <View style={styles.labelContainer}>
      <Text style={styles.label}>{translations.selectLanguage}</Text>
    </View>

    <View style={styles.pickerContainer}>
      <Picker
        style={styles.picker}
        selectedValue={languageCode}
        onValueChange={changeLanguage}
      >
        {supportedLangauage.map((language) => (
          <Picker.Item
            key={language.code}
            label={language.name}
            value={language.code}
          />
        ))}
      </Picker>
    </View>

    <Button onPress={handleContinue} title={translations.continue} />
  </View>
)

export default compose(
  connect(
    (state) => ({
      languageCode: state.languageCode,
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
