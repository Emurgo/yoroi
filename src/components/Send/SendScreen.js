// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import CustomText from '../CustomText'
import {authenticate} from '../../helpers/authentication'

import styles from './styles/SendScreen.style'

type Props = {
  isAuthenticated: boolean,
};

const SendScreen = ({isAuthenticated}: Props) => (
  <View style={styles.container}>
    <CustomText style={styles.welcome}>
      {isAuthenticated ? 'Authentication successful' : 'Authentication failed' }
    </CustomText>
  </View>
)

export default compose(
  connect((state) => ({
    isAuthenticated: authenticate(),
  })),
)(SendScreen)
