import React from 'react'
import {StyleSheet, View} from 'react-native'

import {
  AdaAppClosedError,
  BluetoothDisabledError,
  GeneralConnectionError,
  LedgerUserError,
  RejectedByUserError,
} from '../../yoroi-wallets/hw'
import {Button} from '../Button'
import {Icon} from '../Icon'
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
  return (
    <>
      <View style={styles.container}>
        <View>
          <Icon.Danger color="#FF1351" size={42} />
        </View>

        <Text style={styles.message}>{message}</Text>
      </View>

      <View style={styles.buttons}>
        <Button shelleyTheme outlineOnLight block onPress={onCancel} title={strings.cancel} />

        <Button shelleyTheme block onPress={resetErrorBoundary} title={strings.tryAgain} />
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
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Rubik-Regular',
    color: '#FF1351',
    textAlign: 'center',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
})
