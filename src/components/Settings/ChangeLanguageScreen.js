// @flow

import React from 'react'
import {SafeAreaView} from 'react-navigation'
import {withHandlers} from 'recompose'
import {compose} from 'redux'
import {connect} from 'react-redux'

import languageActions from '../../actions/language'
import LanguagePicker from '../Common/LanguagePicker'
import {languageSelector} from '../../selectors'

import styles from './styles/ChangeLanguageScreen.style'

const LanguagePickerScreen = ({
  navigation,
  languageCode,
  changeLanguage,
  handleContinue,
}) => (
  <SafeAreaView style={styles.safeAreaView}>
    <LanguagePicker
      {...{navigation, languageCode, changeLanguage, handleContinue}}
    />
  </SafeAreaView>
)

export default compose(
  connect(
    (state, {navigation}) => ({
      languageCode: languageSelector(state),
    }),
    languageActions,
  ),
  withHandlers({
    handleContinue: ({
      navigation,
      changeAndSaveLanguage,
      languageCode,
    }) => async (event) => {
      await changeAndSaveLanguage(languageCode)

      navigation.goBack(null)
    },
  }),
)(LanguagePickerScreen)
