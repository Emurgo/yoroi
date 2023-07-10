import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'

import {HelperText, TextInput} from '../../../../components'

export const maxMemoLength = 256

type Props = {
  memo: string
  onChangeText: (memo: string) => void
}

export const InputMemo = ({onChangeText, memo}: Props) => {
  const strings = useStrings()

  const showError = memo.length > maxMemoLength

  return (
    <View style={styles.container}>
      <TextInput
        value={memo}
        onChangeText={(memo) => onChangeText(memo)}
        label={strings.label}
        autoComplete="off"
        testID="memoFieldInput"
        errorText={showError ? 'error' : undefined} // to show the error styling
        renderComponentStyle={styles.input}
        noHelper
        multiline
        focusable
      />

      <View style={styles.helper}>
        <Message showError={showError} />

        <LengthCounter memo={memo} showError={showError} />
      </View>
    </View>
  )
}

const Message = ({showError}: {showError: boolean}) => {
  const strings = useStrings()
  return <HelperText type={showError ? 'error' : 'info'}>{showError ? strings.error : strings.message}</HelperText>
}

const LengthCounter = ({memo, showError}: {memo: string; showError: boolean}) => {
  return (
    <HelperText type={showError ? 'error' : 'info'}>
      <Text>{`${memo.length}/${maxMemoLength}`}</Text>
    </HelperText>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    label: intl.formatMessage(messages.label),
    message: intl.formatMessage(messages.message),
    error: intl.formatMessage(messages.error),
  }
}

export const messages = defineMessages({
  label: {
    id: 'components.send.memofield.label',
    defaultMessage: '!!!Memo',
  },
  message: {
    id: 'components.send.memofield.message',
    defaultMessage: '!!!(Optional) Memo is stored locally',
  },
  error: {
    id: 'components.send.memofield.error',
    defaultMessage: '!!!Memo is too long',
  },
})

const styles = StyleSheet.create({
  container: {
    paddingBottom: 25,
  },
  helper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    maxHeight: 80,
  },
})
