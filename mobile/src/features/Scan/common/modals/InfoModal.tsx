import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

type Props = {
  title: string
  message: string
  onClose: () => void
}

export const InfoModal = ({title: _title, message, onClose}: Props) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <Modal.Content>
      <View style={[a.gap_lg, a.px_lg]}>
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>{message}</Text>
      </View>

      <Modal.Footer>
        <Button title={strings.global.ok} onPress={onClose} />
      </Modal.Footer>
    </Modal.Content>
  )
}

export const useInfoModal = () => {
  const {openModal, closeModal} = useModal()

  const open = React.useCallback(
    ({title, message}: {title: string; message: string}) => {
      openModal({
        title,
        content: (
          <InfoModal title={title} message={message} onClose={closeModal} />
        ),
        height: 250,
        onClose: closeModal,
      })
    },
    [openModal, closeModal],
  )

  return {openInfoModal: open, closeModal}
}
