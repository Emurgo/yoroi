// @flow

import React from 'react'
import {Text, View} from 'react-native'
import styles from './WalletInitScreen.style'

const WalletInitScreen = () => (
  <View
    style={styles.container}
  >
    <Text style={styles.welcome}>
    Choose between restoring and creating new wallet
    </Text>
  </View>
)

export default WalletInitScreen


