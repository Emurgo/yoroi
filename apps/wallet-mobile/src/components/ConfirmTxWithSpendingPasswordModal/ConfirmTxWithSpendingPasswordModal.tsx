import React, {useRef} from 'react'
import {ActivityIndicator, StyleSheet, TextInput as RNTextInput, View} from 'react-native'

import {debugWalletInfo, features} from '../../features'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {WrongPassword} from '../../yoroi-wallets/cardano/errors'
import {useSignTxWithPassword, useSubmitTx} from '../../yoroi-wallets/hooks'
import {YoroiSignedTx, YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {Button} from '../Button'
import {Spacer} from '../Spacer'
import {Text} from '../Text'
import {TextInput} from '../TextInput'
import {useStrings} from './strings'

type Props = {
  onSuccess?: (signedTx: YoroiSignedTx) => void
  unsignedTx: YoroiUnsignedTx
  onError?: () => void
}

export const ConfirmTxWithSpendingPasswordModal = ({onSuccess, unsignedTx, onError}: Props) => {
  const spendingPasswordRef = useRef<RNTextInput>(null)
  const wallet = useSelectedWallet()
  const {signTx, error: signError, isLoading: signIsLoading} = useSignTxWithPassword({wallet})
  const {submitTx, error: submitError, isLoading: submitIsLoading} = useSubmitTx({wallet}, {onError})
  const strings = useStrings()

  const [spendingPassword, setSpendingPassword] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )

  const onSubmit = (password: string) => {
    signTx(
      {unsignedTx, password},
      {
        onSuccess: (signedTx) => {
          submitTx(signedTx, {onSuccess: () => onSuccess?.(signedTx)})
        },
      },
    )
  }

  const error = signError || submitError
  const isLoading = signIsLoading || submitIsLoading
  return (
    <>
      <Text style={styles.modalText}>{strings.enterSpendingPassword}</Text>

      <TextInput
        secureTextEntry
        ref={spendingPasswordRef}
        enablesReturnKeyAutomatically
        placeholder={strings.spendingPassword}
        value={spendingPassword}
        onChangeText={(text) => setSpendingPassword(text)}
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
