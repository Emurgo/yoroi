// @flow

import React from 'react'
import {SafeAreaView} from 'react-navigation'

import LanguagePicker from './LanguagePicker'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'

import styles from './styles/LanguagePickerScreen.style'

type Props = {
  changeLanguageAction: () => mixed,
  navigation: NavigationScreenProp<NavigationState>,
  languageCode: string,
}

const LanguagePickerScreen = ({navigation}: Props) => (
  <SafeAreaView style={styles.safeAreaView}>
    <LanguagePicker navigation={navigation} />
  </SafeAreaView>
)

export default LanguagePickerScreen
