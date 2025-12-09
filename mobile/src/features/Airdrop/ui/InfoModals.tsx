import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ScrollView, Text} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'

import {DestinationAddressIllustration} from '../illustrations/DestinationAddressIllustration'
import {RedeemableNowIllustration} from '../illustrations/RedeemableNowIllustration'

const RedeemableNowInfoModalContent = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <ScrollView
      contentContainerStyle={[a.p_lg, a.align_center]}
      style={a.flex_1}
    >
      <RedeemableNowIllustration width={200} height={200} />
      <Space.Height.lg />
      <Text style={[a.heading_2_medium, ta.text_gray_max, a.text_center]}>
        {strings.airdrop.redeemableNowInfoTitle}
      </Text>
      <Space.Height.md />
      <Text style={[a.body_1_lg_regular, ta.text_gray_medium, a.text_center]}>
        {strings.airdrop.redeemableNowInfoMessage}
      </Text>
    </ScrollView>
  )
}

const RedeemableNowInfoModalFooter = () => {
  const {closeModal} = useModal()
  const strings = useStrings()

  return (
    <Modal.Footer>
      <Button
        title={strings.global.close}
        onPress={closeModal}
        type={ButtonType.Primary}
      />
    </Modal.Footer>
  )
}

const DestinationAddressInfoModalContent = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <ScrollView
      contentContainerStyle={[a.p_lg, a.align_center]}
      style={a.flex_1}
    >
      <DestinationAddressIllustration width={200} height={200} />
      <Space.Height.lg />
      <Text style={[a.heading_2_medium, ta.text_gray_max, a.text_center]}>
        {strings.airdrop.destinationAddressInfoTitle}
      </Text>
      <Space.Height.md />
      <Text style={[a.body_1_lg_regular, ta.text_gray_medium, a.text_center]}>
        {strings.airdrop.destinationAddressInfoMessage}
      </Text>
    </ScrollView>
  )
}

const DestinationAddressInfoModalFooter = () => {
  const {closeModal} = useModal()
  const strings = useStrings()

  return (
    <Modal.Footer>
      <Button
        title={strings.global.close}
        onPress={closeModal}
        type={ButtonType.Primary}
      />
    </Modal.Footer>
  )
}

export const useRedeemableNowInfoModal = () => {
  const {openModal, closeModal} = useModal()

  const open = React.useCallback(() => {
    openModal({
      title: '',
      content: <RedeemableNowInfoModalContent />,
      footer: <RedeemableNowInfoModalFooter />,
      height: 500,
      onClose: closeModal,
    })
  }, [openModal, closeModal])

  return {openRedeemableNowInfoModal: open, closeModal}
}

export const useDestinationAddressInfoModal = () => {
  const {openModal, closeModal} = useModal()

  const open = React.useCallback(() => {
    openModal({
      title: '',
      content: <DestinationAddressInfoModalContent />,
      footer: <DestinationAddressInfoModalFooter />,
      height: 500,
      onClose: closeModal,
    })
  }, [openModal, closeModal])

  return {openDestinationAddressInfoModal: open, closeModal}
}
