import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {TextInput as RNTextInput, View} from 'react-native'

import {debugWalletInfo, features} from '~/kernel/features'
import {useStrings} from '~/kernel/i18n/useStrings'
import {ActivityIndicator} from '~/ui/ActivityIndicator/ActivityIndicator'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'
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
  summary?: string
}

export const ConfirmWithSpendingPassword = ({
  onSubmit,
  isLoading,
  error,
  onPasswordChange,
  summary,
}: Props) => {
  const spendingPasswordRef = React.useRef<RNTextInput>(null)
  const [spendingPassword, setSpendingPassword] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )
  const strings = useStrings()
  const {palette: p} = useTheme()

  const errorMessage = error
    ? getErrorMessage(error, {
        wrongPasswordMessage: strings.swap.wrongPasswordMessage,
        error: strings.global.error,
        missingCollateral: strings.swap.missingCollateral,
      })
    : null

  return (
    <View style={[a.flex_1, a.px_lg]}>
      <Text
        style={[
          {paddingHorizontal: 70},
          a.text_center,
          {paddingBottom: 8, color: p.gray_900},
        ]}
      >
        {summary ?? strings.swap.enterSpendingPassword}
      </Text>

      <TextInput
        secureTextEntry
        ref={spendingPasswordRef}
        enablesReturnKeyAutomatically
        placeholder={strings.swap.spendingPassword}
        value={spendingPassword}
        onChangeText={(text) => {
          setSpendingPassword(text)
          onPasswordChange?.()
        }}
        error={errorMessage != null}
        errorText={errorMessage ?? undefined}
        autoComplete="off"
      />

      <Space.Height._2xs fill />

      <Button
        testID="swapButton"
        title={strings.swap.sign}
        onPress={() => onSubmit?.(spendingPassword)}
        disabled={spendingPassword.length === 0}
      />

      {isLoading && (
        <View
          style={[
            a.absolute,
            {height: '100%', left: 0, right: 0},
            a.align_center,
            a.justify_center,
          ]}
        >
          <ActivityIndicator />
        </View>
      )}
    </View>
  )
}
