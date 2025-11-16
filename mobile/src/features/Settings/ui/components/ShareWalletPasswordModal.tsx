import {atoms as a, useTheme} from '@yoroi/theme'
import {App} from '@yoroi/types'

import * as React from 'react'
import {ActivityIndicator, TextInput as RNTextInput, View} from 'react-native'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {Checkmark, TextInput} from '~/ui/TextInput/TextInput'

type Props = {
  onSuccess: (password: string) => void
  onError?: (error: unknown) => void
}

export const ShareWalletPasswordModal = ({onSuccess, onError}: Props) => {
  const passwordRef = React.useRef<RNTextInput>(null)
  const {wallet} = useSelectedWallet()
  const {isDark, palette: p} = useTheme()
  const strings = useStrings()

  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [isValidating, setIsValidating] = React.useState(false)
  const isPasswordCorrect = useIsPasswordCorrect(password)

  const handleSubmit = React.useCallback(async () => {
    if (!password) {
      setError('Password is required')
      return
    }

    if (!isPasswordCorrect) {
      setError(strings.settings.shareWallet.wrongPassword)
      return
    }

    setIsValidating(true)
    setError(null)

    try {
      // Verify password by attempting to read the root key
      await wallet.encryptedStorage.xpriv.read(password)
      onSuccess(password)
    } catch (err) {
      const errorMessage = getErrorMessage(err, {
        wrongPasswordMessage: strings.settings.shareWallet.wrongPassword,
        error: strings.settings.shareWallet.error,
      })
      setError(errorMessage)
      onError?.(err)
    } finally {
      setIsValidating(false)
    }
  }, [password, isPasswordCorrect, wallet, onSuccess, onError, strings])

  return (
    <View style={[a.flex_1, a.px_lg]}>
      <TextInput
        secureTextEntry
        ref={passwordRef}
        enablesReturnKeyAutomatically
        placeholder={strings.settings.shareWallet.password}
        value={password}
        onChangeText={(text) => {
          setPassword(text)
          setError(null)
        }}
        autoComplete="off"
        right={isPasswordCorrect ? <Checkmark /> : null}
        onSubmitEditing={handleSubmit}
      />

      {error != null && (
        <Text
          style={[a.text_center, {color: p.sys_magenta_500}, a.pt_sm]}
          numberOfLines={3}
        >
          {error}
        </Text>
      )}

      <Space.Height.lg fill />

      <View style={[a.pt_lg]}>
        <Button
          testID="confirmButton"
          title={strings.settings.shareWallet.confirm}
          onPress={handleSubmit}
          disabled={password.length === 0 || isValidating}
        />
      </View>

      {isValidating && (
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
    if (!password) {
      setIsPasswordCorrect(false)
      return
    }

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
