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
  const {styles, colors} = useStyles()
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

      <Text style={[styles.details, {color: colors.details}]}>{strings.singleOrMultipleDetails}</Text>

      <Spacer fill height={24} />

      <View style={styles.buttonContainer}>
        <Button
          style={styles.multipleButton}
          outline
          title={strings.selectMultiple}
          textStyles={{
            color: colors.selectMultipleInsteadTextColor,
          }}
          onPress={handleOnMultiple}
        />

        <Spacer height={6} />

        <Button shelleyTheme title={strings.singleAddressWallet} onPress={handleOnSingle} style={styles.button} />
      </View>

      <Spacer height={24} />
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    buttonContainer: {
      alignSelf: 'stretch',
      backgroundColor: 'transparent',
    },
    details: {
      ...atoms.body_1_lg_regular,
      justifyContent: 'center',
      textAlign: 'center',
    },

    button: {
      backgroundColor: color.primary_c500,
    },
    multipleButton: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
  })

  const colors = {
    details: color.gray_c900,
    selectMultipleInsteadTextColor: color.primary_c500,
  }

  return {styles, colors} as const
}
