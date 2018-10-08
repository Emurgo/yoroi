// @flow

import React from 'react'
import {View} from 'react-native'
import CustomText from '../CustomText'
import styles from './SettingsScreen.style'

const SettingsScreen = () => (
  <View style={styles.container}>
    <CustomText style={styles.welcome}>
    i18nChange your settings here
    </CustomText>
  </View>
)

export default SettingsScreen


