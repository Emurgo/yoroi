// @flow

import React from 'react'
import {View} from 'react-native'
import {Text} from '../UiKit'
import {withTranslations} from '../../utils/renderUtils'

import styles from './styles/SigninScreen.style'

const getTranslations = (state) => state.trans.SigninScreen

const SigninScreen = ({translations}) => (
  <View style={styles.container}>
    <Text style={styles.welcome}>{translations.welcomeText}</Text>
  </View>
)

export default withTranslations(getTranslations)(SigninScreen)
