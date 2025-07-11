import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {Button} from '../../../ui/Button/Button'
import {useModal} from '../../../ui/Modal/ModalContext'
import {Space} from '../../../ui/Space/Space'
import {useStrings} from './useStrings'

export const useOpenUnverifiedDappModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const insets = useSafeAreaInsets()
  const {palette: p} = useTheme()

  const open = React.useCallback(
    (options: {onClose: () => void; onConfirm: () => void}) => {
      openModal({
        title: strings.disclaimerModalTitle,
        content: (
          <View style={[a.px_lg, a.flex_col, a.flex_1]}>
            <View
              style={[
                a.flex,
                a.flex_row,
                a.align_center,
                a.justify_center,
                a.gap_xs,
              ]}
            >
              <Text style={[a.body_1_lg_regular, {color: p.gray_900}]}>
                {strings.disclaimerModalText}
              </Text>
            </View>

            <Space.Height.sm fill />
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
      p.gray_900,
      strings.disclaimerModalText,
      strings.disclaimerModalTitle,
      strings.understand,
    ],
  )
  return {openUnverifiedDappModal: open, closeModal}
}
