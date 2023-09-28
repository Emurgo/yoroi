import React from 'react'
import {ActivityIndicator, StyleSheet, TextInput as RNTextInput, View} from 'react-native'

import {Button, Spacer, Text, TextInput} from '../../../../components'
import {debugWalletInfo, features} from '../../../../features'
import {COLORS} from '../../../../theme'
import {WrongPassword} from '../../../../yoroi-wallets/cardano/errors'
import {useStrings} from '../../common/strings'

type Props = {
  onSubmit?: (spendingPassword: string) => void
  isLoading?: boolean
  error?: Error
}

export const ConfirmWithSpendingPassword = ({onSubmit, isLoading, error}: Props) => {
  const spendingPasswordRef = React.useRef<RNTextInput>(null)
  const [spendingPassword, setSpendingPassword] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )
  const strings = useStrings()

  return (
    <>
      <Text style={styles.modalText}>{strings.enterSpendingPassword}</Text>

      <TextInput
        secureTextEntry
        ref={spendingPasswordRef}
        enablesReturnKeyAutomatically
        placeholder={strings.spendingPassword}
        value={spendingPassword}
        onChangeText={setSpendingPassword}
        autoComplete="off"
      />

      {error !== null ? (
        <View>
          <Text style={styles.errorMessage} numberOfLines={3}>
            {getErrorMessage(error, strings)}
          </Text>
        </View>
      ) : null}

      <Spacer fill />

      <Button testID="swapButton" shelleyTheme title={strings.sign} onPress={() => onSubmit?.(spendingPassword)} />

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
  },
  loading: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
