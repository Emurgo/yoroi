import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {
  AdaAppClosedError,
  BluetoothDisabledError,
  GeneralConnectionError,
  LedgerUserError,
  RejectedByUserError,
} from '../../../wallets/hw/hw'
import {Button, ButtonType} from '../Button/Button'
import {Icon} from '../Icon'
import {Space} from '../Space/Space'
import {Text} from '../Text/Text'
import {useStrings} from './strings'

type Props = {
  error: Error
  resetErrorBoundary?: () => void
  onCancel?: () => void
}

export const ModalError = ({error, resetErrorBoundary, onCancel}: Props) => {
  const strings = useStrings()
  const {color} = useTheme()
  const message = getErrorMessage(error, strings)

  return (
    <>
      <View style={styles.container}>
        <View>
          <Icon.Danger color={color.sys_magenta_500} size={42} />
        </View>

        <Text style={[styles.message, {color: color.sys_magenta_500}]}>
          {message}
        </Text>
      </View>

      <View style={styles.buttons}>
        <Button
          size="S"
          type={ButtonType.Secondary}
          onPress={onCancel}
          title={strings.cancel}
        />

        <Space width="lg" />

        <Button
          size="S"
          onPress={resetErrorBoundary}
          title={strings.tryAgain}
        />
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

const styles = StyleSheet.create({
  message: {
    ...a.body_1_lg_regular,
    ...a.text_center,
  },
  container: {
    ...a.px_lg,
    ...a.flex_grow,
    ...a.align_center,
    ...a.justify_center,
  },
  buttons: {
    ...a.flex_row,
    ...a.align_center,
    ...a.justify_center,
    ...a.p_lg,
  },
})
