import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {FIRST_RUN_ROUTES} from '../../../legacy/RoutesList'
import {LanguagePicker} from '../../components'
import {changeAndSaveLanguage, changeLanguage} from '../../legacy/language'
import {languageSelector} from '../../legacy/selectors'

export const LanguagePickerScreen = () => {
  const navigation = useNavigation()
  const languageCode = useSelector(languageSelector) || 'en-US'
  const dispatch = useDispatch()

  const handleContinue = async () => {
    await dispatch(changeAndSaveLanguage(languageCode))

    navigation.navigate(FIRST_RUN_ROUTES.ACCEPT_TERMS_OF_SERVICE)
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <LanguagePicker
        languageCode={languageCode}
        changeLanguage={(languageCode: string) => dispatch(changeLanguage(languageCode))}
        handleContinue={handleContinue}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
})
