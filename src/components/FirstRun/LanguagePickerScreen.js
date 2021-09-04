// @flow

import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigation} from '@react-navigation/native'

import {FIRST_RUN_ROUTES} from '../../RoutesList'
import {changeAndSaveLanguage, changeLanguage} from '../../actions/language'
import LanguagePicker from '../Common/LanguagePicker'
import {languageSelector} from '../../selectors'

import styles from './styles/LanguagePickerScreen.style'

const LanguagePickerScreen = () => {
  const navigation = useNavigation()
  const languageCode = useSelector(languageSelector) || 'en-US'
  const dispatch = useDispatch()

  const handleContinue = async () => {
    await dispatch(changeAndSaveLanguage(languageCode))

    navigation.navigate(FIRST_RUN_ROUTES.ACCEPT_TERMS_OF_SERVICE)
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <LanguagePicker languageCode={languageCode} changeLanguage={changeLanguage} handleContinue={handleContinue} />
    </SafeAreaView>
  )
}

export default LanguagePickerScreen
