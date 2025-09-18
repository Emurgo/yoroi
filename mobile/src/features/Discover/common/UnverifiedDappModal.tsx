import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Space} from '~/ui/Space/Space'

export const useOpenUnverifiedDappModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const insets = useSafeAreaInsets()
  const {palette: p} = useTheme()

  const open = React.useCallback(
    (options: {onClose: () => void; onConfirm: () => void}) => {
      openModal({
        title: strings.discover.disclaimerModalTitle,
        content: (
          <View style={[a.flex_col, a.flex_1]}>
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
                {strings.discover.disclaimerModalText}
              </Text>
            </View>

            <Space.Height.sm fill />
          </View>
        ),
        footer: (
          <Button
            title={strings.discover.understand}
            onPress={() => {
              options.onConfirm()
              closeModal()
            }}
          />
        ),
        height: 320 + insets.bottom,
        onClose: options.onClose,
        canDiscard: false, // Prevent accidental dismissal by tapping backdrop
      })
    },
    [
      insets.bottom,
      openModal,
      closeModal,
      p.gray_900,
      strings.discover.disclaimerModalText,
      strings.discover.disclaimerModalTitle,
      strings.discover.understand,
    ],
  )
  return {openUnverifiedDappModal: open, closeModal}
}
