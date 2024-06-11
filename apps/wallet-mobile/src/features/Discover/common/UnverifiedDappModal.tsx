import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer, useModal} from '../../../components'
import {useStrings} from './useStrings'

type Props = {
  onConfirm: () => void
}

export const unverifiedDappModalHeight = 334

export const useOpenUnverifiedDappModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const open = React.useCallback(
    (options: {onClose: () => void; onConfirm: () => void}) => {
      openModal(
        strings.disclaimerModalTitle,
        <UnverifiedDappModal onConfirm={options.onConfirm} />,
        unverifiedDappModalHeight,
        options.onClose,
      )
    },
    [openModal, strings.disclaimerModalTitle],
  )
  return {openUnverifiedDappModal: open, closeModal}
}

export const UnverifiedDappModal = ({onConfirm}: Props) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <>
      <View style={styles.line}>
        <Text style={styles.text}>{strings.disclaimerModalText}</Text>
      </View>

      <Spacer fill />

      <Button title={strings.understand} shelleyTheme onPress={onConfirm} />
    </>
  )
}

const useStyles = () => {
  const theme = useTheme()
  const styles = StyleSheet.create({
    line: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    text: {
      color: theme.color.gray_c900,
      fontSize: 16,
      lineHeight: 24,
    },
  })
  return {styles}
}
