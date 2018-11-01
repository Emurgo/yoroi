// @flow

import React from 'react'
import {compose} from 'redux'
import {Alert, View} from 'react-native'

import PinInput from '../Security/PinInput'
import {withTranslations} from '../../utils/renderUtils'

import styles from './styles/LoginScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'
import type {ComponentType} from 'react'

const getTranslations = (state) => state.trans.LoginScreen

type ExportedProps = {}

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

export default (compose(withTranslations(getTranslations))(
  ReceiveScreen,
): ComponentType<ExportedProps>)
