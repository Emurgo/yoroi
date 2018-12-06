// @flow

import React from 'react'
import {SafeAreaView} from 'react-native'

import WalletDescription from './WalletInit/WalletDescription'

import styles from './styles/SplashScreen.styles'

const SplashScreen = () => (
  <SafeAreaView style={styles.safeAreaView}>
    <WalletDescription />
  </SafeAreaView>
)

export default SplashScreen
