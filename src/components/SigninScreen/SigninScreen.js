// @flow

import React from 'react'
import {Text, View} from 'react-native'
import styles from './SigninScreen.style'

const SigninScreen = () => (
  <View
    style={styles.container}
  >
    <Text style={styles.welcome}>
    Sign with PIN / TouchID
    </Text>
  </View>
)

export default SigninScreen
