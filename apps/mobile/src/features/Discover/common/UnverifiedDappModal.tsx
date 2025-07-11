import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {Button} from '../../../ui/Button/Button'
import {useModal} from '../../../ui/Modal/ModalContext'
import {Spacer} from '../../../ui/Space/Space'
import {useStrings} from './useStrings'

export const useOpenUnverifiedDappModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const insets = useSafeAreaInsets()
  const {color} = useTheme()

  const open = React.useCallback(
    (options: {onClose: () => void; onConfirm: () => void}) => {
      openModal({
        title: strings.disclaimerModalTitle,
        content: (
          <View style={styles.container}>
            <View style={styles.line}>
              <Text style={[styles.text, {color: color.gray_900}]}>{strings.disclaimerModalText}</Text>
            </View>

            <Spacer fill />
          </View>
        ),
        footer: (
          <Button title={strings.understand} onPress={options.onConfirm} />
        ),
        height: 320 + insets.bottom,
        onClose: options.onClose,
      })
    },
    [
      insets.bottom,
      openModal,
      strings.disclaimerModalText,
      strings.disclaimerModalTitle,
      strings.understand,
      styles.container,
      styles.line,
      styles.text,
    ],
  )
  return {openUnverifiedDappModal: open, closeModal}
}

const styles = StyleSheet.create({
  line: {
    ...a.flex,
    ...a.flex_row,
    ...a.align_center,
    ...a.justify_center,
    ...a.gap_xs,
  },
  text: {
    ...a.body_1_lg_regular,
  },
  container: {
    ...a.px_lg,
    ...a.flex_col,
    ...a.flex_1,
  },
  actions: {
    ...a.py_lg,
  },
})