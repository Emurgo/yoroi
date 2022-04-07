import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {changeAndSaveLanguage, changeLanguage} from '../../../legacy/actions/language'
import {LanguagePicker} from '../../components'
import {languageSelector} from '../../legacy/selectors'

export const ChangeLanguageScreen = () => {
  const navigation = useNavigation()
  const languageCode = useSelector(languageSelector)
  const dispatch = useDispatch()
  const handleContinue = async () => {
    await dispatch(changeAndSaveLanguage(languageCode))

    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <LanguagePicker
        languageCode={languageCode}
        handleContinue={handleContinue}
        changeLanguage={(languageCode) => dispatch(changeLanguage(languageCode))}
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
