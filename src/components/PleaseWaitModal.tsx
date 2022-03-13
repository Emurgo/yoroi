import React from 'react'
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native'

import {Modal} from './Modal'
import {Spacer} from './Spacer'
type PleaseWaitViewProps = {
  title: string
  spinnerText: string
}
export const PleaseWaitView = ({title, spinnerText}: PleaseWaitViewProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>

    <ActivityIndicator size="large" color="black" />

    <Spacer height={12} />

    <Text style={styles.wait}>{spinnerText}</Text>
  </View>
)

type Props = {
  visible: boolean
  title: string
  spinnerText: string
}
export const PleaseWaitModal = ({visible, title, spinnerText}: Props) => (
  <Modal noPadding visible={visible} onRequestClose={() => null}>
    <PleaseWaitView title={title} spinnerText={spinnerText} />
  </Modal>
)

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 18,
    color: '#000',
    marginBottom: 35,
    textAlign: 'center',
  },
  wait: {
    marginTop: 7,
    marginBottom: 12,
    fontSize: 13,
    textAlign: 'center',
  },
})
