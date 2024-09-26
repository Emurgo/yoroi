import * as React from 'react'

import {Button} from '../../../components/Button/Button'
import {useModal} from '../../../components/Modal/ModalContext'
import {Spacer} from '../../../components/Spacer/Spacer'
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
      openModal(strings.continueOnLedger, <HWNotSupportedModal onConfirm={onConfirm} />, modalHeight, onClose)
    },
    [openModal, strings.continueOnLedger],
  )
  return {showHWNotSupportedModal, closeModal}
}

const HWNotSupportedModal = ({onConfirm}: Props) => {
  const strings = useStrings()
  return (
    <>
      <Text>{strings.signDataNotSupported}</Text>

      <Spacer fill />

      <Button title={strings.cancel} onPress={onConfirm} />
    </>
  )
}
