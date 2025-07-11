import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useMultipleAddressesInfo} from '../../features/Receive/common/useMultipleAddressesInfo'
import {useStrings} from '../../features/Receive/common/useStrings'
import {useAddressMode} from '../../features/WalletManager/common/hooks/useAddressMode'
import {Button, ButtonType} from '../Button/Button'
import {useModal} from '../Modal/ModalContext'
import {QRs} from '../QRsIllustration/QRsIllustration'
import {Spacer} from '../Space/Space'

export const singleOrMultipleAddressesModalHeight = 580

type Props = {
  onConfirm: (addressMode: Wallet.AddressMode) => void
}

export const SingleOrMultipleAddressesModal = ({onConfirm}: Props) => {
  const strings = useStrings()
  const {enableMultipleMode, enableSingleMode} = useAddressMode()

  const {hideMultipleAddressesInfo} = useMultipleAddressesInfo()

  const {closeModal} = useModal()
  const {color} = useTheme()

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
    <View style={styles.modal}>
      <QRs />

      <Text style={[styles.details, {color: color.text_gray_medium}]}>
        {strings.singleOrMultipleDetails}
      </Text>

      <Spacer fill height={16} />

      <View style={styles.actions}>
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

const styles = StyleSheet.create({
  modal: {
    ...a.flex_1,
    ...a.align_center,
    ...a.justify_between,
    ...a.px_lg,
    ...a.py_lg,
  },
  actions: {
    ...a.flex_col,
    ...a.gap_sm,
    ...a.w_full,
    height: 120,
  },
  details: {
    ...a.body_1_lg_regular,
    ...a.justify_center,
    ...a.text_center,
  },
})
