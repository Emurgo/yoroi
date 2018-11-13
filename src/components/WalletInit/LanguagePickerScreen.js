// @flow

import React from 'react'
import {View} from 'react-native'

import Screen from '../Screen'
import LanguagePicker from './LanguagePicker'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import {COLORS} from '../../styles/config'

import styles from './styles/LanguagePickerScreen.style'

type Props = {
  changeLanguageAction: () => mixed,
  navigation: NavigationScreenProp<NavigationState>,
  languageCode: string,
}

const LanguagePickerScreen = ({navigation}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT}>
    <View style={styles.container}>
      <LanguagePicker navigation={navigation} />
    </View>
  </Screen>
)

export default LanguagePickerScreen
