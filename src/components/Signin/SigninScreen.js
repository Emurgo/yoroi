// @flow

import React from 'react'
import {View} from 'react-native'
import CustomText from '../CustomText'
import styles from './styles/SigninScreen.style'

const SigninScreen = () => (
  <View style={styles.container}>
    <CustomText style={styles.welcome}>
    i18nSign with PIN / TouchID
    </CustomText>
  </View>
)

export default SigninScreen
