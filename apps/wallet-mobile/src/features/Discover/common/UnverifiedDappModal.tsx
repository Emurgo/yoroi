import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {Button} from '../../../components/Button/Button'
import {useModal} from '../../../components/Modal/ModalContext'
import {Spacer} from '../../../components/Spacer/Spacer'
import {useStrings} from './useStrings'

type Props = {
  onConfirm: () => void
}

const unverifiedDappModalHeight = 304

export const useOpenUnverifiedDappModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const insets = useSafeAreaInsets()

  const open = React.useCallback(
    (options: {onClose: () => void; onConfirm: () => void}) => {
      openModal(
        strings.disclaimerModalTitle,
        <UnverifiedDappModal onConfirm={options.onConfirm} />,
        unverifiedDappModalHeight + insets.bottom,
        options.onClose,
      )
    },
    [insets.bottom, openModal, strings.disclaimerModalTitle],
  )
  return {openUnverifiedDappModal: open, closeModal}
}

export const UnverifiedDappModal = ({onConfirm}: Props) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.container}>
      <View style={styles.line}>
        <Text style={styles.text}>{strings.disclaimerModalText}</Text>
      </View>

      <Spacer fill />

      <View style={styles.actions}>
        <Button title={strings.understand} shelleyTheme onPress={onConfirm} />
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    line: {
      ...atoms.flex,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.justify_center,
      ...atoms.gap_xs,
    },
    text: {
      color: color.gray_900,
      ...atoms.body_1_lg_regular,
    },
    container: {
      ...atoms.px_lg,
      ...atoms.flex_col,
      ...atoms.flex_1,
    },
    actions: {
      ...atoms.py_lg,
    },
  })
  return {styles}
}
