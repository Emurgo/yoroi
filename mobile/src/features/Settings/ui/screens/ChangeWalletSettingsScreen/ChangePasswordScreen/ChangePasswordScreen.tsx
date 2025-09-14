import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {ScrollView, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useDebouncedValue} from '~/hooks/useDebouncedValue'
import {usePromise} from '~/hooks/usePromise'
import {requiredPasswordLength} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {isEmptyString} from '~/kernel/utils'
import {Button} from '~/ui/Button/Button'
import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'
import {YoroiWallet} from '~/wallets/cardano/types'

export const ChangePasswordScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation()
  const {atoms: ta, palette: p} = useTheme()
  const {wallet} = useSelectedWallet()

  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [repeatPassword, setRepeatPassword] = React.useState('')

  const deboucedNewPassword = useDebouncedValue(newPassword)
  const deboucedRepeatPassword = useDebouncedValue(repeatPassword)

  const {changePassword, isPending, error} = useChangePassword(wallet, {
    onSuccess: () => navigation.goBack(),
  })

  const handleChangePassword = () => {
    changePassword({currentPassword, newPassword})
  }

  const hasErrors =
    deboucedNewPassword.length < requiredPasswordLength ||
    (deboucedNewPassword !== deboucedRepeatPassword &&
      !isEmptyString(deboucedRepeatPassword)) ||
    deboucedNewPassword === currentPassword

  const newPasswordErrorText =
    deboucedNewPassword.length > 0 &&
    deboucedNewPassword.length < requiredPasswordLength
      ? strings.settings.changePassword.passwordStrengthRequirement
      : undefined

  const repeatPasswordErrorText =
    deboucedRepeatPassword.length > 0 &&
    deboucedNewPassword !== deboucedRepeatPassword
      ? strings.settings.changePassword.repeatPasswordInputNotMatchError
      : undefined

  return (
    <KeyboardAvoidingView style={[ta.bg_color_max, a.flex_1]} enabled>
      <SafeAreaView
        style={[a.flex_1, a.pt_lg, ta.bg_color_max, a.pb_lg]}
        edges={['left', 'right', 'bottom']}
      >
        <ScrollView
          contentContainerStyle={[a.px_lg, a.gap_md]}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <CurrentPasswordInput
            returnKeyType="done"
            errorDelay={0}
            enablesReturnKeyAutomatically
            autoFocus
            label={strings.settings.changePassword.oldPasswordInputLabel}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoComplete="password"
          />

          <PasswordInput
            returnKeyType="done"
            errorDelay={0}
            enablesReturnKeyAutomatically
            label={strings.settings.changePassword.newPasswordInputLabel}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoComplete="new-password"
            errorText={newPasswordErrorText}
          />

          <PasswordConfirmationInput
            returnKeyType="done"
            errorDelay={0}
            enablesReturnKeyAutomatically
            label={strings.settings.changePassword.repeatPasswordInputLabel}
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            secureTextEntry
            autoComplete="new-password"
            errorText={repeatPasswordErrorText}
          />

          {error && (
            <>
              <Text
                style={[
                  a.body_1_lg_regular,
                  {
                    color: p.sys_magenta_500,
                  },
                ]}
              >
                {strings.settings.changePassword.incorrectPassword}
              </Text>
            </>
          )}
        </ScrollView>

        <Actions>
          <Button
            onPress={handleChangePassword}
            disabled={hasErrors || isPending}
            title={strings.settings.changePassword.continueButton}
          />
        </Actions>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const CurrentPasswordInput = TextInput
const PasswordInput = TextInput
const PasswordConfirmationInput = TextInput
const Actions = (props: ViewProps) => {
  return <View {...props} style={[a.px_lg, a.pt_lg]} />
}

const useChangePassword = (
  wallet: YoroiWallet,
  options?: {
    onSuccess?: () => void
    onError?: (error: Error) => void
  },
) => {
  const {walletManager} = useWalletManager()

  const changePassword = React.useCallback(
    async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string
      newPassword: string
    }) => {
      await walletManager.changeWalletPassword({
        id: wallet.id,
        oldPassword: currentPassword,
        newPassword,
      })
    },
    [walletManager, wallet.id],
  )

  const promise = usePromise({
    promise: changePassword,
    ...options,
  })

  return {
    changePassword: promise.resolve,
    ...promise,
  }
}
