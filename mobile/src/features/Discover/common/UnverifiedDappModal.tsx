import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

export const useOpenUnverifiedDappModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const insets = useSafeAreaInsets()
  const {atoms: ta} = useTheme()

  const open = React.useCallback(
    (options: {onClose: () => void; onConfirm: () => void}) => {
      openModal({
        title: strings.discover.disclaimerModalTitle,
        content: (
          <Modal.Content style={[a.flex_col]}>
            <View
              style={[
                a.flex,
                a.flex_row,
                a.align_center,
                a.justify_center,
                a.gap_xs,
              ]}
            >
              <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
                {strings.discover.disclaimerModalText}
              </Text>
            </View>
          </Modal.Content>
        ),
        footer: (
          <Modal.Footer>
            <Button
              title={strings.discover.understand}
              onPress={() => {
                options.onConfirm()
                closeModal()
              }}
            />
          </Modal.Footer>
        ),
        height: 320 + insets.bottom,
        onClose: options.onClose,
        canDiscard: false,
      })
    },
    [
      insets.bottom,
      openModal,
      closeModal,
      ta.text_gray_max,
      strings.discover.disclaimerModalText,
      strings.discover.disclaimerModalTitle,
      strings.discover.understand,
    ],
  )
  return {openUnverifiedDappModal: open, closeModal}
}
