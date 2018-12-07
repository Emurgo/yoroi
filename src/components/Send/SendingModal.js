// @flow

import React from 'react'
import {Text, ActivityIndicator, View} from 'react-native'

import {withTranslations} from '../../utils/renderUtils'
import {Modal} from '../UiKit'

import styles from './styles/SendingModal.style'

import type {ComponentType} from 'react'

const getTranslations = (state) => state.trans.WaitSendTransactionModal

const SendingModal = ({translations, visible}) => (
  <Modal noPadding visible={visible} onRequestClose={() => null}>
    <View style={styles.container}>
      <Text style={styles.heading}>{translations.heading}</Text>

      <ActivityIndicator size="large" />

      <Text style={styles.wait}>{translations.pleaseWait}</Text>
    </View>
  </Modal>
)

type ExternalProps = {
  visible: boolean,
}

export default (withTranslations(getTranslations)(SendingModal): ComponentType<
  ExternalProps,
>)
