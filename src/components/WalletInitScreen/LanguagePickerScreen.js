// @flow

import React from 'react'
import {View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import WalletDescription from './WalletDescription'
import Screen from '../Screen'
import LanguagePicker from './LanguagePicker'
import BackgroundVisualArtefacts from './BackgroundVisualArtefacts'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import {COLORS} from '../../styles/config'

import styles from './LanguagePickerScreen.style'

type Props = {
  changeLanguageAction: () => mixed,
  navigation: NavigationScreenProp<NavigationState>,
  languageCode: string,
};

const LanguagePickerScreen = ({navigation}: Props) => (
  <LinearGradient
    start={{x: 0, y: 0}}
    end={{x: 1, y: 0}}
    colors={[COLORS.PRIMARY_GRADIENT_START, COLORS.PRIMARY_GRADIENT_END]}
    style={styles.gradient}
  >
    <BackgroundVisualArtefacts />
    <Screen bgColor={COLORS.TRANSPARENT}>
      <View style={styles.container}>
        <WalletDescription />

        <LanguagePicker navigation={navigation} />
      </View>
    </Screen>
  </LinearGradient>
)

export default LanguagePickerScreen
