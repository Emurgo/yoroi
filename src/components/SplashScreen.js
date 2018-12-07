// @flow

import React from 'react'
import {SafeAreaView} from 'react-native'

import {StatusBar, ScreenBackground} from './UiKit'
import WalletDescription from './WalletInit/WalletDescription'

import styles from './styles/SplashScreen.styles'

const SplashScreen = () => (
  <ScreenBackground>
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <WalletDescription />
    </SafeAreaView>
  </ScreenBackground>
)

export default SplashScreen
