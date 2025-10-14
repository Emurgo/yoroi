import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useMultipleAddressesInfo} from '~/features/Receive/common/useMultipleAddressesInfo'
import {useAddressMode} from '~/features/WalletManager/hooks/useAddressMode'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

import QRs from '../QRsIllustration/QRsIllustration'

export const singleOrMultipleAddressesModalHeight = 580

const SingleOrMultipleAddressesModalContent = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <View style={[a.flex_1, a.align_center, a.justify_between, a.py_lg]}>
      <QRs />

      <Text
        style={[
          a.body_1_lg_regular,
          a.justify_center,
          a.text_center,
          ta.text_gray_medium,
        ]}
      >
        {strings.receive.singleOrMultipleDetails}
      </Text>
    </View>
  )
}

const SingleOrMultipleAddressesModalFooter = ({onConfirm, onClose}: Props) => {
  const strings = useStrings()
  const {enableMultipleMode, enableSingleMode} = useAddressMode()

  const {hideMultipleAddressesInfo} = useMultipleAddressesInfo()

  const handleOnMultiple = () => {
    enableMultipleMode()
    hideMultipleAddressesInfo({
      onSuccess: () => {
        onClose()
        onConfirm('multiple')
      },
    })
  }

  const handleOnSingle = () => {
    enableSingleMode()
    hideMultipleAddressesInfo({
      onSuccess: () => {
        onClose()
        onConfirm('single')
      },
    })
  }

  return (
    <Modal.Footer>
      <Button
        type={ButtonType.Text}
        title={strings.receive.selectMultiple}
        onPress={handleOnMultiple}
      />

      <Button
        title={strings.receive.singleAddressWallet}
        onPress={handleOnSingle}
      />
    </Modal.Footer>
  )
}

export const SingleOrMultipleAddressesModal = {
  Content: SingleOrMultipleAddressesModalContent,
  Footer: SingleOrMultipleAddressesModalFooter,
}

type Props = {
  onConfirm: (addressMode: Wallet.AddressMode) => void
  onClose: () => void
}
