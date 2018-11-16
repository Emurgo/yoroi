// @flow

import React from 'react'
import {StyleSheet, SafeAreaView} from 'react-native'

import {Text} from './UiKit'

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
})

const SplashScreen = () => (
  <SafeAreaView style={styles.safeAreaView}>
    <Text>Application is loading...</Text>
  </SafeAreaView>
)

export default SplashScreen
