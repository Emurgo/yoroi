// @flow

import React from 'react'
import {Text, ActivityIndicator, View} from 'react-native'

import Modal from './Modal'

import styles from './styles/PleaseWaitModal.style'

import type {ComponentType} from 'react'

const SendingModal = ({visible, title, spinnerText}) => (
  <Modal noPadding visible={visible} onRequestClose={() => null}>
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <ActivityIndicator size="large" />

      <Text style={styles.wait}>{spinnerText}</Text>
    </View>
  </Modal>
)

type ExternalProps = {
  visible: boolean,
  title: string,
  spinnerText: string,
}

export default (SendingModal: ComponentType<ExternalProps>)
