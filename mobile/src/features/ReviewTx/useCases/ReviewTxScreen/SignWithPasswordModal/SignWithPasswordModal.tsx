import {atoms as a, useTheme} from '@yoroi/theme'
import {UnsignedTransaction} from '@yoroi/tx'
import {App} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as CSL from '@emurgo/cross-csl-core'
import * as React from 'react'
import {ActivityIndicator, TextInput as RNTextInput, View} from 'react-native'

import {useSignTxWithPassword} from '~/features/Transactions/hooks/useSignTxWithPassword'
import {useSubmitTx} from '~/features/Transactions/hooks/useSubmitTx'
import {debugWalletInfo, features} from '~/kernel/features'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {Checkmark, TextInput} from '~/ui/TextInput/TextInput'

type Props = {
  onSuccess?: (signedTx: CSL.Transaction) => void
  unsignedTx: UnsignedTransaction
  onError?: (error: unknown) => void
}

export const SignWithPasswordModal = ({
  onSuccess,
  unsignedTx,
  onError,
}: Props) => {
  const spendingPasswordRef = React.useRef<RNTextInput>(null)
  const {wallet} = useSelectedWallet()
  const {isDark, palette: p} = useTheme()
  const {
    signTx,
    error: signError,
    isPending: signIsLoading,
  } = useSignTxWithPassword({wallet})
  const {
    submitTx,
    error: submitError,
    isPending: submitIsLoading,
  } = useSubmitTx(
    {
      wallet,
    },
    {
      onError: (error) => {
        // Don't call onError for wrong password errors - show inline error instead
        if (!(error instanceof App.Errors.WrongPassword)) {
          onError?.(error)
        }
      },
    },
  )
  const strings = useStrings()

  const [spendingPassword, setSpendingPassword] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )
  const isPasswordCorrect = useIsPasswordCorrect(spendingPassword)

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

  const errorMessage = error
    ? getErrorMessage(error, {
        wrongPasswordMessage: strings.staking.wrongPassword,
        error: strings.staking.error,
      })
    : null

  return (
    <View style={[a.flex_1]}>
      <Text style={[a.text_center, a.pb_sm]}>
        {strings.staking.enterPassword}
      </Text>

      <TextInput
        secureTextEntry
        ref={spendingPasswordRef}
        enablesReturnKeyAutomatically
        placeholder={strings.staking.password}
        value={spendingPassword}
        onChangeText={(text) => setSpendingPassword(text)}
        autoComplete="off"
        right={isPasswordCorrect ? <Checkmark /> : null}
      />

      {errorMessage != null && (
        <Text
          style={[a.text_center, {color: p.sys_magenta_500}]}
          numberOfLines={3}
        >
          {errorMessage}
        </Text>
      )}

      <Space.Height.lg fill />

      <View style={[a.pt_lg]}>
        <Button
          testID="confirmButton"
          title={strings.staking.sign}
          onPress={() => onSubmit?.(spendingPassword)}
          disabled={spendingPassword.length === 0 || isLoading}
        />
      </View>

      {isLoading && (
        <View
          style={[
            a.absolute,
            {height: '100%', left: 0, right: 0},
            a.align_center,
            a.justify_center,
          ]}
        >
          <ActivityIndicator size="large" color={isDark ? 'white' : 'black'} />
        </View>
      )}
    </View>
  )
}

const useIsPasswordCorrect = (password: string) => {
  const {wallet} = useSelectedWallet()
  const [isPasswordCorrect, setIsPasswordCorrect] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true
    wallet.encryptedStorage.xpriv
      .read(password)
      .then(() => isMounted && setIsPasswordCorrect(true))
      .catch(() => isMounted && setIsPasswordCorrect(false))
    return () => {
      isMounted = false
    }
  }, [password, wallet])
  return isPasswordCorrect
}

const getErrorMessage = (
  error: unknown,
  strings: Record<'wrongPasswordMessage' | 'error', string>,
) => {
  if (error instanceof App.Errors.WrongPassword) {
    return strings.wrongPasswordMessage
  }
  if (error instanceof Error) {
    return error.message
  }

  return strings.error
}
