import * as React from 'react'

import {Button} from '../../../components/Button/Button'
import {useModal} from '../../../components/Modal/ModalContext'
import {Text} from '../../../components/Text'
import {useStrings} from './useStrings'

type Props = {
  onConfirm(): void
}

const modalHeight = 350

export const useShowHWNotSupportedModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const showHWNotSupportedModal = React.useCallback(
    ({onConfirm, onClose}: {onConfirm: Props['onConfirm']; onClose: () => void}) => {
      openModal({
        title: strings.continueOnLedger,
        content: <Text>{strings.signDataNotSupported}</Text>,
        footer: <Button title={strings.cancel} onPress={onConfirm} />,
        height: modalHeight,
        onClose,
      })
    },
    [openModal, strings.cancel, strings.continueOnLedger, strings.signDataNotSupported],
  )
  return {showHWNotSupportedModal, closeModal}
}
