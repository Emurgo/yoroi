// @flow

import React from 'react'
import {SafeAreaView} from 'react-native'

import {StatusBar} from './UiKit'
import WalletDescription from './WalletInit/WalletDescription'

import styles from './styles/SplashScreen.styles'

const SplashScreen = () => (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar type="dark" />

    <WalletDescription />
  </SafeAreaView>
)

export default SplashScreen
