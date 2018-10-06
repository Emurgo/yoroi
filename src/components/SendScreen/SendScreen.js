// @flow

import React from 'react'
import {View} from 'react-native'
import CustomText from '../CustomText'
import styles from './SendScreen.style'

const SendScreen = () => (
  <View style={styles.container}>
    <CustomText style={styles.welcome}>
    i18nSend all your ADA here
    </CustomText>
  </View>
)

export default SendScreen


