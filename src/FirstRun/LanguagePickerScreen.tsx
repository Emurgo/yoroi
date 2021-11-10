// @flow

import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {changeAndSaveLanguage, changeLanguage} from '../../legacy/actions/language'
import LanguagePicker from '../../legacy/components/Common/LanguagePicker'
import {FIRST_RUN_ROUTES} from '../../legacy/RoutesList'
import {languageSelector} from '../../legacy/selectors'

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

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
})
