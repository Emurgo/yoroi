import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, TextInput as RNTextInput, View} from 'react-native'

import {Button} from '../../../../components/Button/Button'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {Text} from '../../../../components/Text'
import {TextInput} from '../../../../components/TextInput/TextInput'
import {debugWalletInfo, features} from '../../../../kernel/features'
import {useStrings} from '../../common/strings'
import {ActivityIndicator} from '../ConfirmRawTx/ActivityIndicator'
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

export const ConfirmWithSpendingPassword = ({onSubmit, isLoading, error, onPasswordChange, summary}: Props) => {
  const spendingPasswordRef = React.useRef<RNTextInput>(null)
  const [spendingPassword, setSpendingPassword] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )
  const strings = useStrings()
  const styles = useStyles()

  const errorMessage = error ? getErrorMessage(error, strings) : null

  return (
    <View style={styles.root}>
      <Text style={styles.modalText}>{summary ?? strings.enterSpendingPassword}</Text>

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
        title={strings.sign}
        onPress={() => onSubmit?.(spendingPassword)}
        disabled={spendingPassword.length === 0}
      />

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
    },
    modalText: {
      paddingHorizontal: 70,
      ...atoms.text_center,
      paddingBottom: 8,
      color: color.gray_900,
    },
    loading: {
      ...atoms.absolute,
      height: '100%',
      left: 0,
      right: 0,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
  })

  return styles
}
