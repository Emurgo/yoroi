import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {
  AdaAppClosedError,
  BluetoothDisabledError,
  GeneralConnectionError,
  LedgerUserError,
  RejectedByUserError,
} from '../../yoroi-wallets/hw/hw'
import {Button, ButtonType} from '../Button/Button'
import {Icon} from '../Icon'
import {Space} from '../Space/Space'
import {Text} from '../Text'
import {useStrings} from './strings'

type Props = {
  error: Error
  resetErrorBoundary?: () => void
  onCancel?: () => void
}

export const ModalError = ({error, resetErrorBoundary, onCancel}: Props) => {
  const strings = useStrings()
  const message = getErrorMessage(error, strings)
  const {styles, colors} = useStyles()

  return (
    <>
      <View style={styles.container}>
        <View>
          <Icon.Danger color={colors.error} size={42} />
        </View>

        <Text style={styles.message}>{message}</Text>
      </View>

      <View style={styles.buttons}>
        <Button size="S" type={ButtonType.Secondary} onPress={onCancel} title={strings.cancel} />

        <Space width="lg" />

        <Button size="S" onPress={resetErrorBoundary} title={strings.tryAgain} />
      </View>
    </>
  )
}

const getErrorMessage = (
  error: Error,
  strings: Record<
    | 'error'
    | 'rejectedByUser'
    | 'bluetoothDisabledError'
    | 'ledgerUserError'
    | 'ledgerGeneralConnectionError'
    | 'ledgerBluetoothDisabledError'
    | 'ledgerAdaAppNeedsToBeOpenError',
    string
  >,
): string => {
  if (error instanceof RejectedByUserError) {
    return strings.rejectedByUser
  }

  if (error instanceof BluetoothDisabledError) {
    return strings.bluetoothDisabledError
  }

  if (error instanceof LedgerUserError) {
    return strings.ledgerUserError
  }

  if (error instanceof GeneralConnectionError) {
    return strings.ledgerGeneralConnectionError
  }

  if (error instanceof BluetoothDisabledError) {
    return strings.ledgerBluetoothDisabledError
  }

  if (error instanceof AdaAppClosedError) {
    return strings.ledgerAdaAppNeedsToBeOpenError
  }

  return `${strings.error}: ${error.message}`
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    message: {
      color: color.sys_magenta_500,
      ...atoms.body_1_lg_regular,
      ...atoms.text_center,
    },
    container: {
      ...atoms.px_lg,
      ...atoms.flex_grow,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    buttons: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.justify_center,
      ...atoms.p_lg,
    },
  })

  const colors = {
    error: color.sys_magenta_500,
  }

  return {styles, colors} as const
}
