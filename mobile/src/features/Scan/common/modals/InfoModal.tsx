import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

const InfoModalContent = ({message}: {message: string}) => {
  const {atoms: ta} = useTheme()

  return (
    <Modal.Content>
      <View style={[a.gap_lg, a.px_lg]}>
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>{message}</Text>
      </View>
    </Modal.Content>
  )
}

const InfoModalFooter = ({onClose}: {onClose: () => void}) => {
  const strings = useStrings()

  return (
    <Modal.Footer>
      <Button title={strings.global.ok} onPress={onClose} />
    </Modal.Footer>
  )
}

export const useInfoModal = () => {
  const {openModal, closeModal} = useModal()

  const open = React.useCallback(
    ({title, message}: {title: string; message: string}) => {
      openModal({
        title,
        content: <InfoModalContent message={message} />,
        footer: <InfoModalFooter onClose={closeModal} />,
        height: 250,
        onClose: closeModal,
      })
    },
    [openModal, closeModal],
  )

  return {openInfoModal: open, closeModal}
}
