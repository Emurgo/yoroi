import {atoms as a, useTheme} from '@yoroi/theme'
import {App} from '@yoroi/types'
import * as React from 'react'
import {ActivityIndicator, TextInput as RNTextInput, View} from 'react-native'

import {useStrings} from '../../kernel/i18n/useStrings'

import {useSignTxWithPassword} from '../../features/Transactions/hooks/useSignTxWithPassword'
import {useSubmitTx} from '../../features/Transactions/hooks/useSubmitTx'
import {useSelectedWallet} from '../../features/WalletManager/hooks/useSelectedWallet'
import {debugWalletInfo, features} from '../../kernel/features'
import {YoroiSignedTx, YoroiUnsignedTx} from '../../wallets/types/yoroi'
import {Button} from '../Button/Button'
import {Space} from '../Space/Space'
import {Text} from '../Text/Text'
import {Checkmark, TextInput} from '../TextInput/TextInput'

type Props = {
  onSuccess?: (signedTx: YoroiSignedTx) => void
  unsignedTx: YoroiUnsignedTx
  onError?: (error: unknown) => void
}

export const ConfirmTxWithSpendingPasswordModal = ({
  onSuccess,
  unsignedTx,
  onError,
}: Props) => {
  const spendingPasswordRef = useRef<RNTextInput>(null)
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
  } = useSubmitTx({wallet}, {onError})
  const strings = useStrings()

  const [spendingPassword, setSpendingPassword] = useState(
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
    <View style={[a.flex_1, a.px_lg, a.pb_lg]}>
      <Text
        style={[{paddingHorizontal: 70}, a.text_center, a.pb_sm]}
      >
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
          style={[{color: p.sys_magenta_500, textAlign: 'center'}]}
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
          disabled={spendingPassword.length === 0}
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
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false)

  useEffect(() => {
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
