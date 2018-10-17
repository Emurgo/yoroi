// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Alert, View} from 'react-native'

import PinInput from '../Security/PinInput'

import styles from './styles/LoginScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslation = (state) => state.trans.login

type Props = {
  translation: SubTranslation<typeof getTranslation>,
};

const ReceiveScreen = ({translation}: Props) => (
  <View style={styles.root}>
    <PinInput
      pinMaxLength={6}
      labels={{title: 'Enter PIN', subtitle: 'Wallet name', subtitle2: ''}}
      onPinEnter={(pin) => Alert.alert('PIN', pin)}
    />
  </View>
)

export default compose(
  connect((state) => ({
    translation: getTranslation(state),
  })),
)(ReceiveScreen)
