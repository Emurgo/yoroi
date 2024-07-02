import {useCallback} from 'react'
import React from 'react'

import {Button, Spacer, useModal} from '../../../components'
import {Text} from '../../../components'
import {useStrings} from './useStrings'

type Props = {
  onConfirm(): void
}

const modalHeight = 350

export const useShowHWNotSupportedModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const showHWNotSupportedModal = useCallback(
    ({onConfirm, onClose}: {onConfirm: Props['onConfirm']; onClose: () => void}) => {
      openModal(strings.continueOnLedger, <HWNotSupportedModal onConfirm={onConfirm} />, modalHeight, onClose)
    },
    [openModal, strings.continueOnLedger],
  )
  return {showHWNotSupportedModal, closeModal}
}

export const HWNotSupportedModal = ({onConfirm}: Props) => {
  const strings = useStrings()
  return (
    <>
      <Text>{strings.signDataNotSupported}</Text>

      <Spacer fill />

      <Button title={strings.cancel} shelleyTheme onPress={onConfirm} />
    </>
  )
}
