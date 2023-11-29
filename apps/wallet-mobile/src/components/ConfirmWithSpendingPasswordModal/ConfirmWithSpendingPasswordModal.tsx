import React from 'react'
import {ActivityIndicator, StyleSheet, TextInput as RNTextInput, View} from 'react-native'
import {debugWalletInfo, features} from '../../features'
import {TextInput} from '../TextInput'
import {Text} from '../Text'
import {Spacer} from '../Spacer'
import {Button} from '../Button'
import {WrongPassword} from '../../yoroi-wallets/cardano/errors'
import {COLORS} from '../../theme'

export type ErrorData = {
  errorMessage: string
  errorLogs?: unknown
}

type Props = {
  onSubmit?: (spendingPassword: string) => void
  isLoading?: boolean
  error?: Error
  onPasswordChange?: () => void
  strings: {
    enterSpendingPassword: string
    spendingPassword: string
    sign: string
    wrongPasswordMessage: string
    error: string
  }
}

export const ConfirmWithSpendingPasswordModal = ({onSubmit, isLoading, error, onPasswordChange, strings}: Props) => {
  const spendingPasswordRef = React.useRef<RNTextInput>(null)
  const [spendingPassword, setSpendingPassword] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )

  return (
    <>
      <Text style={styles.modalText}>{strings.enterSpendingPassword}</Text>

      <TextInput
        secureTextEntry
        ref={spendingPasswordRef}
        enablesReturnKeyAutomatically
        placeholder={strings.spendingPassword}
        value={spendingPassword}
        onChangeText={(text) => {
          setSpendingPassword(text)
          onPasswordChange && onPasswordChange()
        }}
        autoComplete="off"
      />

      {error != null && (
        <View>
          <Text style={styles.errorMessage} numberOfLines={3}>
            {getErrorMessage(error, strings)}
          </Text>
        </View>
      )}

      <Spacer fill />

      <Button
        testID="confirmButton"
        shelleyTheme
        title={strings.sign}
        onPress={() => onSubmit?.(spendingPassword)}
        disabled={spendingPassword.length === 0}
      />

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
    </>
  )
}

const getErrorMessage = (error: unknown, strings: Record<'wrongPasswordMessage' | 'error', string>) => {
  if (error instanceof WrongPassword) {
    return strings.wrongPasswordMessage
  }
  if (error instanceof Error) {
    return error.message
  }

  return strings.error
}

const styles = StyleSheet.create({
  modalText: {
    paddingHorizontal: 70,
    textAlign: 'center',
    paddingBottom: 8,
  },
  errorMessage: {
    color: COLORS.ERROR_TEXT_COLOR,
    textAlign: 'center',
  },
  loading: {
    position: 'absolute',
    height: '100%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
