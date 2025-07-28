import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useMultipleAddressesInfo} from '~/features/Receive/common/useMultipleAddressesInfo'
import {useStrings} from '~/features/Receive/common/useStrings'
import {useAddressMode} from '~/features/WalletManager/hooks/useAddressMode'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/ModalContext'
import {QRs} from '~/ui/QRsIllustration/QRsIllustration'

export const singleOrMultipleAddressesModalHeight = 580

type Props = {
  onConfirm: (addressMode: Wallet.AddressMode) => void
}

export const SingleOrMultipleAddressesModal = ({onConfirm}: Props) => {
  const strings = useStrings()
  const {enableMultipleMode, enableSingleMode} = useAddressMode()

  const {hideMultipleAddressesInfo} = useMultipleAddressesInfo()

  const {closeModal} = useModal()
  const {palette: p} = useTheme()

  const handleOnMultiple = () => {
    enableMultipleMode()
    hideMultipleAddressesInfo({
      onSuccess: () => {
        closeModal()
        onConfirm('multiple')
      },
    })
  }

  const handleOnSingle = () => {
    enableSingleMode()
    hideMultipleAddressesInfo({
      onSuccess: () => {
        closeModal()
        onConfirm('single')
      },
    })
  }

  return (
    <View
      style={[a.flex_1, a.align_center, a.justify_between, a.px_lg, a.py_lg]}
    >
      <QRs />

      <Text
        style={[
          a.body_1_lg_regular,
          a.justify_center,
          a.text_center,
          {color: p.text_gray_medium},
        ]}
      >
        {strings.singleOrMultipleDetails}
      </Text>

      <View style={[{flex: 1}]} />

      <View style={[a.flex_col, a.gap_sm, a.w_full, {height: 120}]}>
        <Button
          type={ButtonType.Text}
          title={strings.selectMultiple}
          onPress={handleOnMultiple}
        />

        <Button title={strings.singleAddressWallet} onPress={handleOnSingle} />
      </View>
    </View>
  )
}
