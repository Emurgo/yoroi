import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'

export const useOpenNetworkNoticeModal = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()
  const {openModal, closeModal} = useModal()

  const openNetworkNoticeModal = React.useCallback(
    (onClose?: () => void) => {
      const handleClose = () => {
        closeModal()
        onClose?.()
      }

      openModal({
        title: strings.settings.changeNetwork.networkNoticeTitle,
        canDiscard: false,
        content: (
          <Modal.Content>
            <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
              {strings.settings.changeNetwork.networkNoticeMessage}
            </Text>

            <Space.Height.lg />

            <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
              {strings.settings.changeNetwork.networkNoticeListTitle}
            </Text>

            <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
              {strings.settings.changeNetwork.networkNoticeList}
            </Text>
          </Modal.Content>
        ),
        footer: (
          <Modal.Footer>
            <Button
              title={strings.settings.changeNetwork.networkNoticeButton}
              onPress={handleClose}
            />
          </Modal.Footer>
        ),
        height: 450,
      })
    },
    [openModal, closeModal, strings, ta.text_gray_max],
  )

  return openNetworkNoticeModal
}
