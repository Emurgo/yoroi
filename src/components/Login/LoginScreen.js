// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Alert, View} from 'react-native'

import PinInput from '../Security/PinInput'

import styles from './styles/LoginScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.LoginScreen

type Props = {
  translations: SubTranslation<typeof getTranslations>,
}

const ReceiveScreen = ({translations}: Props) => (
  <View style={styles.root}>
    <PinInput
      pinMaxLength={6}
      labels={{
        title: translations.title,
        subtitle: 'getWalletName()',
        subtitle2: '',
      }}
      onPinEnter={(pin) => Alert.alert('PIN', pin)}
    />
  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
)(ReceiveScreen)
