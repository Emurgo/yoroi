import {Datum} from '@emurgo/yoroi-lib'
import React from 'react'
import {ActivityIndicator, StyleSheet, TextInput as RNTextInput, View} from 'react-native'

import {Button, Spacer, Text, TextInput} from '../../../../components'
import {debugWalletInfo, features} from '../../../../features'
import {COLORS} from '../../../../theme'
import {isEmptyString} from '../../../../utils'
import {WrongPassword} from '../../../../yoroi-wallets/cardano/errors'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useSignWithPasswordAndSubmitTx} from '../../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {useStrings} from '../../common/strings'

type ErrorData = {
  errorMessage: string
  errorLogs?: unknown
}

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  datum: Datum
  onSuccess: () => void
  onCancel?: () => void
}

export const ConfirmTxWithPassword = ({wallet, onSuccess, unsignedTx, datum}: Props) => {
  const spendingPasswordRef = React.useRef<RNTextInput>(null)
  const [spendingPassword, setSpendingPassword] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )
  const [errorData, setErrorData] = React.useState<ErrorData>({
    errorMessage: '',
    errorLogs: '',
  })
  const strings = useStrings()

  React.useEffect(() => {
    setErrorData({errorMessage: '', errorLogs: ''})
  }, [spendingPassword])

  const {signAndSubmitTx, isLoading} = useSignWithPasswordAndSubmitTx(
    {wallet}, //
    {submitTx: {onSuccess}},
  )

  const showError = ({errorMessage, errorLogs}: ErrorData) => {
    setErrorData({
      errorMessage,
      errorLogs,
    })
  }

  const onConfirm = async () => {
    try {
      const rootKey = await wallet.encryptedStorage.rootKey.read(spendingPassword)
      if (rootKey !== undefined) {
        signAndSubmitTx({unsignedTx, password: spendingPassword, datum})
      }
    } catch (err) {
      if (err instanceof WrongPassword) {
        showError({
          errorMessage: strings.incorrectPasswordTitle,
          errorLogs: strings.incorrectPasswordMessage,
        })
      } else {
        showError({
          errorMessage: strings.generalTxErrorMessage,
          errorLogs: err,
        })
      }
    }
  }

  const isConfirmationDisabled = !wallet.isEasyConfirmationEnabled && isEmptyString(spendingPassword) && !wallet.isHW

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

      <Text style={styles.error}>{errorData.errorMessage}</Text>

      <Spacer fill />

      <Button
        testID="swapButton"
        shelleyTheme
        title={strings.sign}
        onPress={onConfirm}
        disabled={isConfirmationDisabled || isLoading}
      />

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  modalText: {
    paddingHorizontal: 70,
    textAlign: 'center',
    paddingBottom: 8,
  },
  loading: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: COLORS.ERROR_TEXT_COLOR,
    textAlign: 'center',
  },
})
