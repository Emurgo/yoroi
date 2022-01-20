import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {changeAndSaveLanguage, changeLanguage} from '../../../legacy/actions/language'
import LanguagePicker from '../../../legacy/components/Common/LanguagePicker'
import styles from '../../../legacy/components/Settings/styles/ChangeLanguageScreen.style'
import {languageSelector} from '../../../legacy/selectors'

export const ChangeLanguageScreen = () => {
  const navigation = useNavigation()
  const languageCode = useSelector(languageSelector)
  const dispatch = useDispatch()
  const handleContinue = async (_event) => {
    await dispatch(changeAndSaveLanguage(languageCode))

    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <LanguagePicker
        {...{navigation, languageCode, handleContinue}}
        changeLanguage={(languageCode) => dispatch(changeLanguage(languageCode))}
      />
    </SafeAreaView>
  )
}
