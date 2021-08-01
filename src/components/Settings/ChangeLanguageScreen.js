// @flow

import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {changeAndSaveLanguage, changeLanguage} from '../../actions/language'
import LanguagePicker from '../Common/LanguagePicker'
import {languageSelector} from '../../selectors'

import styles from './styles/ChangeLanguageScreen.style'

type Props = {|
  navigation: any,
  route: any,
|}

const LanguagePickerScreen = ({navigation}: Props) => {
  const languageCode = useSelector(languageSelector)
  const dispatch = useDispatch()
  const handleContinue = async (_event) => {
    await dispatch(changeAndSaveLanguage(languageCode))

    navigation.goBack(null)
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

export default LanguagePickerScreen
