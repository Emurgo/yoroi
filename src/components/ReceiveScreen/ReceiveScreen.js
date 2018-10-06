// @flow

import React from 'react'
import {View} from 'react-native'
import CustomText from '../CustomText'
import styles from './ReceiveScreen.style'

const ReceiveScreen = () => (
  <View style={styles.container}>
    <CustomText style={styles.welcome}>
      i18nGenerate your addresses here
    </CustomText>
  </View>
)

export default ReceiveScreen
