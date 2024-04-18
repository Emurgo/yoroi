import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer, useModal} from '../../../../components'
import {AddressMode} from '../../../../wallet-manager/types'
import {useAddressModeManager} from '../../../../wallet-manager/useAddressModeManager'
import {QRs as QRsIllustration} from '../../illustrations/QRs'
import {useMultipleAddressesInfo} from '../useMultipleAddressesInfo'
import {useStrings} from '../useStrings'

export const singleOrMultipleAddressesModalHeight = 580

type Props = {
  onConfirm: (method: AddressMode) => void
}

export const SingleOrMultipleAddressesModal = ({onConfirm}: Props) => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const {enableMultipleMode, enableSingleMode} = useAddressModeManager()

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
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: theme.color.gray_c200,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    buttonContainer: {
      alignSelf: 'stretch',
      backgroundColor: theme.color.gray_cmin,
    },
    details: {
      ...theme.atoms.body_1_lg_regular,
      justifyContent: 'center',
      textAlign: 'center',
    },

    button: {
      backgroundColor: theme.color.primary_c500,
    },
  })

  const colors = {
    details: theme.color.gray_c900,
    selectMultipleInsteadTextColor: theme.color.primary_c500,
  }

  return {styles, colors} as const
}
