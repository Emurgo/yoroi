import {useNavigation} from '@react-navigation/native'
import {useMutation, UseMutationOptions} from '@tanstack/react-query'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  ViewProps,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'
import {YoroiWallet} from '~/wallets/cardano/types'

const REQUIRED_PASSWORD_LENGTH = 10

export const ChangePasswordScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation()
  const {atoms: ta, palette: p} = useTheme()
  const {wallet} = useSelectedWallet()

  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [repeatPassword, setRepeatPassword] = React.useState('')

  const {changePassword, isLoading, error} = useChangePassword(wallet, {
    onSuccess: () => navigation.goBack(),
  })

  const hasErrors =
    newPassword.length < REQUIRED_PASSWORD_LENGTH ||
    newPassword !== repeatPassword ||
    newPassword === currentPassword

  return (
    <KeyboardAvoidingView
      style={[ta.bg_color_max, a.flex_1]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={[a.flex_1]} edges={['left', 'right', 'bottom']}>
        <ScrollView
          contentContainerStyle={[a.p_lg]}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <Space.Height.lg />

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

          <Space.Height.lg />

          <PasswordInput
            returnKeyType="done"
            errorDelay={0}
            enablesReturnKeyAutomatically
            label={strings.settings.changePassword.newPasswordInputLabel}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoComplete="new-password"
            errorText={
              newPassword.length > 0 &&
              newPassword.length < REQUIRED_PASSWORD_LENGTH
                ? strings.settings.changePassword.passwordStrengthRequirement
                : undefined
            }
          />

          <Space.Height.lg />

          <PasswordConfirmationInput
            returnKeyType="done"
            errorDelay={0}
            enablesReturnKeyAutomatically
            label={strings.settings.changePassword.repeatPasswordInputLabel}
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            secureTextEntry
            autoComplete="new-password"
            errorText={
              repeatPassword.length > 0 && newPassword !== repeatPassword
                ? strings.settings.changePassword
                    .repeatPasswordInputNotMatchError
                : undefined
            }
          />

          {error && (
            <>
              <Space.Height.lg />
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
            onPress={() => changePassword({currentPassword, newPassword})}
            disabled={hasErrors}
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
  const {atoms: ta} = useTheme()
  return <View {...props} style={[ta.bg_color_max, a.p_lg]} />
}

const useChangePassword = (
  wallet: YoroiWallet,
  mutationOptions: UseMutationOptions<
    void,
    Error,
    {currentPassword: string; newPassword: string}
  >,
) => {
  const {walletManager} = useWalletManager()
  const {mutate, ...mutation} = useMutation(
    ({currentPassword, newPassword}) =>
      walletManager.changeWalletPassword({
        id: wallet.id,
        oldPassword: currentPassword,
        newPassword,
      }),
    mutationOptions,
  )

  return {
    changePassword: mutate,
    ...mutation,
  }
}
