import {useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer, useModal} from '../../../../components'
import {useAddressMode} from '../../../WalletManager/common/hooks/useAddressMode'
import {QRs as QRsIllustration} from '../../illustrations/QRs'
import {useMultipleAddressesInfo} from '../useMultipleAddressesInfo'
import {useStrings} from '../useStrings'

export const singleOrMultipleAddressesModalHeight = 580

type Props = {
  onConfirm: (addressMode: Wallet.AddressMode) => void
}

export const SingleOrMultipleAddressesModal = ({onConfirm}: Props) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {enableMultipleMode, enableSingleMode} = useAddressMode()

  const {hideMultipleAddressesInfo} = useMultipleAddressesInfo()

  const {closeModal} = useModal()

  const handleOnMultiple = () => {
    enableMultipleMode()
    hideMultipleAddressesInfo()
    closeModal()
    onConfirm('multiple')
  }

  const handleOnSingle = () => {
    enableSingleMode()
    hideMultipleAddressesInfo()
    closeModal()
    onConfirm('single')
  }

  return (
    <View style={styles.modal}>
      <QRsIllustration />

      <Text style={styles.details}>{strings.singleOrMultipleDetails}</Text>

      <Spacer fill height={16} />

      <View style={styles.actions}>
        <Button
          withoutBackground
          textStyles={styles.multipleButtonTitle}
          title={strings.selectMultiple}
          onPress={handleOnMultiple}
        />

        <Button shelleyTheme title={strings.singleAddressWallet} onPress={handleOnSingle} />
      </View>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    modal: {
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_between,
      ...atoms.px_lg,
    },
    actions: {
      ...atoms.self_stretch,
    },
    details: {
      color: color.text_gray_normal,
      ...atoms.body_1_lg_regular,
      ...atoms.justify_center,
      ...atoms.text_center,
    },
    multipleButtonTitle: {
      color: color.text_primary_high,
    },
  })

  return {styles} as const
}
