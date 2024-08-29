import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native'

import {Modal} from './legacy/Modal/Modal'
import {Spacer} from './Spacer'

type PleaseWaitViewProps = {
  title: string
  spinnerText: string
}
export const PleaseWaitView = ({title, spinnerText}: PleaseWaitViewProps) => {
  const {styles, color} = useStyles()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <ActivityIndicator size="large" color={color.gray_900} />

      <Spacer height={12} />

      <Text style={styles.wait}>{spinnerText}</Text>
    </View>
  )
}

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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.p_lg,
    },
    title: {
      color: color.gray_900,
      ...atoms.text_center,
      ...atoms.heading_4_medium,
    },
    wait: {
      color: color.gray_900,
      ...atoms.text_center,
      ...atoms.body_2_md_regular,
      ...atoms.py_lg,
    },
  })
  return {styles, color}
}
