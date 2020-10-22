// @flow

import React from 'react'
import {Text, ActivityIndicator, View} from 'react-native'

import Modal from './Modal'

import styles from './styles/PleaseWaitModal.style'

import type {ComponentType} from 'react'

type Props = {|
  title: string,
  spinnerText: string,
|}
export const PleaseWaitView = ({title, spinnerText}: Props) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>

    <ActivityIndicator size="large" />

    <Text style={styles.wait}>{spinnerText}</Text>
  </View>
)

const PleaseWaitModal = ({visible, title, spinnerText}) => (
  <Modal noPadding visible={visible} onRequestClose={() => null}>
    <PleaseWaitView title={title} spinnerText={spinnerText} />
  </Modal>
)

type ExternalProps = {|
  visible: boolean,
  title: string,
  spinnerText: string,
|}

export default (PleaseWaitModal: ComponentType<ExternalProps>)
