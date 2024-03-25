import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ActivityIndicator, StyleSheet, TextInput as RNTextInput, View} from 'react-native'

import {Button, Spacer, Text, TextInput} from '../../../../components'
import {debugWalletInfo, features} from '../../../../features'
import {useStrings} from '../../common/strings'
import {getErrorMessage} from '../errors'

export type ErrorData = {
  errorMessage: string
  errorLogs?: unknown
}

type Props = {
  onSubmit?: (spendingPassword: string) => void
  isLoading?: boolean
  error?: Error
  onPasswordChange?: () => void
}

export const ConfirmWithSpendingPassword = ({onSubmit, isLoading, error, onPasswordChange}: Props) => {
  const spendingPasswordRef = React.useRef<RNTextInput>(null)
  const [spendingPassword, setSpendingPassword] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )
  const strings = useStrings()
  const styles = useStyles()

  const errorMessage = error ? getErrorMessage(error, strings) : null

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
          onPasswordChange?.()
        }}
        error={errorMessage != null}
        errorText={errorMessage ?? undefined}
        autoComplete="off"
      />

      <Spacer fill />

      <Button
        testID="swapButton"
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

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme

  const styles = StyleSheet.create({
    modalText: {
      paddingHorizontal: 70,
      textAlign: 'center',
      paddingBottom: 8,
      color: color.gray[900],
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

  return styles
}
