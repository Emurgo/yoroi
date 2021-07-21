// @flow

import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {withHandlers} from 'recompose'
import {compose} from 'redux'
import {connect} from 'react-redux'

import {FIRST_RUN_ROUTES} from '../../RoutesList'
import languageActions from '../../actions/language'
import LanguagePicker from '../Common/LanguagePicker'
import {languageSelector} from '../../selectors'

import type {State} from '../../state'
import type {Navigation} from '../../types/navigation'
import type {ComponentType} from 'react'

import styles from './styles/LanguagePickerScreen.style'

type Props = {
  navigation: Navigation,
  languageCode: string,
  changeLanguage: (languageCode: string) => void,
  handleContinue: () => void,
}

const LanguagePickerScreen = ({navigation, languageCode, changeLanguage, handleContinue}: Props) => (
  <SafeAreaView style={styles.safeAreaView}>
    <LanguagePicker {...{navigation, languageCode, changeLanguage, handleContinue}} />
  </SafeAreaView>
)

type ExternalProps = {|
  navigation: Navigation,
  route: any,
|}

export default (compose(
  connect(
    (state: State) => ({
      languageCode: languageSelector(state) || 'en-US',
    }),
    languageActions,
  ),
  withHandlers({
    handleContinue:
      ({navigation, changeAndSaveLanguage, languageCode}) =>
      async (_event) => {
        await changeAndSaveLanguage(languageCode)

        navigation.navigate(FIRST_RUN_ROUTES.ACCEPT_TERMS_OF_SERVICE)
      },
  }),
)(LanguagePickerScreen): ComponentType<ExternalProps>)
