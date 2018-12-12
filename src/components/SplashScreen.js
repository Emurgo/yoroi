// @flow

import React from 'react'
import {SafeAreaView} from 'react-native'

import {StatusBar, ScreenBackground} from './UiKit'

import styles from './styles/SplashScreen.styles'

const SplashScreen = () => (
  <ScreenBackground>
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="dark" />
    </SafeAreaView>
  </ScreenBackground>
)

export default SplashScreen
