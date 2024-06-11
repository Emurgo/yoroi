import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer, useModal} from '../../../components'
import {useStrings} from './useStrings'

type Props = {
  onConfirm: () => void
}

export const unverifiedDappModalHeight = 350

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
    <View>
      <View style={styles.line}>
        <Text style={styles.text}>{strings.disclaimerModalText}</Text>
      </View>

      <Spacer height={26} />

      <Button title={strings.understand} shelleyTheme onPress={onConfirm} />
    </View>
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
