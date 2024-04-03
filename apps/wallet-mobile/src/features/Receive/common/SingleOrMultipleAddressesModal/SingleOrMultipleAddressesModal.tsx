import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer, useModal} from '../../../../components'
import {useAddressModeManager} from '../../../../wallet-manager/useAddressModeManager'
import {QRs} from '../../illustrations/QRs'
import {useMultipleAddressesInfo} from '../useMultipleAddressesInfo'
import {useStrings} from '../useStrings'

export const singleOrMultipleAddressesModalHeight = 580

export const SingleOrMultipleAddressesModal = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const {enableMultipleMode, enableSingleMode} = useAddressModeManager()

  const {hideMultipleAddressesInfo} = useMultipleAddressesInfo()

  const {closeModal} = useModal()

  const handleOnMultiple = () => {
    enableMultipleMode()
    handleOnSingle()
  }

  const handleOnSingle = () => {
    enableSingleMode()
    hideMultipleAddressesInfo()
    closeModal()
  }

  return (
    <View style={styles.modal}>
      <QRs />

      <Text style={[styles.details, {color: colors.details}]}>{strings.singleOrMultipleDetails}</Text>

      <Spacer fill height={24} />

      <View style={styles.buttonContainer}>
        <Button
          outline
          title={strings.selectMultiple}
          textStyles={{
            color: colors.details,
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
      backgroundColor: theme.color['bottom-sheet-background'],
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    buttonContainer: {
      alignSelf: 'stretch',
      backgroundColor: theme.color.gray.min,
    },
    details: {
      ...theme.typography['body-1-l-regular'],
    },

    button: {
      backgroundColor: theme.color.primary[500],
    },
  })

  const colors = {
    details: theme.color.gray[900],
  }

  return {styles, colors} as const
}
