// @flow

import React from 'react'
import {Text, ActivityIndicator, View} from 'react-native'

import Modal from './Modal'

import styles from './styles/PleaseWaitModal.style'
type PleaseWaitViewProps = {|
  title: string,
  spinnerText: string,
|}
export const PleaseWaitView = ({title, spinnerText}: PleaseWaitViewProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>

    <ActivityIndicator size="large" />

    <Text style={styles.wait}>{spinnerText}</Text>
  </View>
)

type Props = {|
  visible: boolean,
  title: string,
  spinnerText: string,
|}
const PleaseWaitModal = ({visible, title, spinnerText}: Props) => (
  <Modal noPadding visible={visible} onRequestClose={() => null}>
    <PleaseWaitView title={title} spinnerText={spinnerText} />
  </Modal>
)

export default PleaseWaitModal
