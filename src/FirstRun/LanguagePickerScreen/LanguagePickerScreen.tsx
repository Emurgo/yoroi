import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {changeAndSaveLanguage, changeLanguage} from '../../../legacy/actions/language'
import {languageSelector} from '../../../legacy/selectors'
import {LanguagePicker} from '../../components'
import {FirstRunRouteNavigation} from '../../navigation'

export const LanguagePickerScreen = () => {
  const navigation = useNavigation<FirstRunRouteNavigation>()
  const languageCode = useSelector(languageSelector) || 'en-US'
  const dispatch = useDispatch()

  const handleContinue = async () => {
    await dispatch(changeAndSaveLanguage(languageCode))
    navigation.navigate('accept-terms-of-service')
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
