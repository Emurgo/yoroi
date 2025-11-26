import {atoms as a, useTheme} from '@yoroi/theme'

import {Buffer} from 'buffer'
import * as React from 'react'
import {View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'

import {useMessageSigning} from './useMessageSigning'

const MAX_MESSAGE_LENGTH_BYTES = 64

const getMessageLengthInBytes = (message: string): number => {
  return Buffer.from(message, 'utf-8').length
}

export const MessageSigningScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {signMessage} = useMessageSigning()
  const {navigateToMessageSigningResult} = useWalletNavigation()

  const [message, setMessage] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const messageLengthBytes = getMessageLengthInBytes(message)
  const isValidLength = messageLengthBytes <= MAX_MESSAGE_LENGTH_BYTES
  const canSign = message.trim().length > 0 && isValidLength && !isLoading

  const lengthInfo =
    strings.transactions.messageSigning.messageSigningLengthInfo(
      messageLengthBytes.toString(),
      MAX_MESSAGE_LENGTH_BYTES.toString(),
    )

  const handleSign = React.useCallback(async () => {
    if (!canSign) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await signMessage(message)
      navigateToMessageSigningResult(result.signature, result.key)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : strings.transactions.messageSigning.error
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [message, canSign, signMessage, navigateToMessageSigningResult, strings])

  return (
    <SafeArea>
      <ScrollView contentContainerStyle={[a.px_lg, a.pb_lg]}>
        <Space.Height.lg />

        <TextInput
          value={message}
          onChangeText={(text) => {
            setMessage(text)
            setError(null)
          }}
          label={strings.transactions.messageSigning.messageSigningInputLabel}
          placeholder={
            strings.transactions.messageSigning.messageSigningPlaceholder
          }
          multiline
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect={false}
          error={!isValidLength || error !== null}
          renderComponentStyle={{minHeight: 120}}
          testID="messageSigningInput"
        />

        <Space.Height.md />

        {!isValidLength && message.length > 0 && (
          <View>
            <Text style={[a.body_2_md_regular, {color: p.sys_magenta_500}]}>
              {strings.transactions.messageSigning.messageSigningMaxLengthError}
            </Text>
            <Space.Height.xs />
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {lengthInfo}
            </Text>
          </View>
        )}

        {error && (
          <View>
            <Space.Height.md />
            <Text style={[a.body_2_md_regular, {color: p.sys_magenta_500}]}>
              {error}
            </Text>
          </View>
        )}
      </ScrollView>

      <SafeArea.Footer>
        <Button
          title={strings.transactions.messageSigning.messageSigningSignButton}
          onPress={handleSign}
          disabled={!canSign}
          isLoading={isLoading}
          testID="messageSigningButton"
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}
