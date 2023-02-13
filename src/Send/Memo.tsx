import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'

import {HelperText, TextInput} from '../components'

export const maxMemoLength = 256

type Props = {
  memo: string
  memoChanged: (memo: string) => void
}

export const Memo = ({memoChanged, memo}: Props) => {
  const strings = useStrings()

  const showError = memo.length > maxMemoLength
  const multilineMax = memo.length > 50

  return (
    <View style={styles.container}>
      <TextInput
        value={memo}
        onChangeText={(memo) => memoChanged(memo.trim())}
        label={strings.label}
        autoComplete={false}
        testID="memoFieldInput"
        errorText={showError ? 'error' : undefined} // to show the error styling
        noHelper={true}
        style={multilineMax && styles.input}
        multiline={true}
      />

      <View style={styles.helper}>
        <Message showError={showError} />

        <Counter memo={memo} showError={showError} />
      </View>
    </View>
  )
}

const Message = ({showError}: {showError: boolean}) => {
  const strings = useStrings()
  return <HelperText type={showError ? 'error' : 'info'}>{showError ? strings.error : strings.warning}</HelperText>
}

const Counter = ({memo, showError}: {memo: string; showError: boolean}) => {
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
    warning: intl.formatMessage(messages.warning),
    error: intl.formatMessage(messages.error),
  }
}

export const messages = defineMessages({
  label: {
    id: 'components.send.memofield.label',
    defaultMessage: '!!!Memo',
  },
  warning: {
    id: 'components.send.memofield.warning',
    defaultMessage: '!!!(Optional) Memo is stored locally',
  },
  error: {
    id: 'components.send.memofield.error',
    defaultMessage: '!!!Memo name is too long',
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
    height: 95,
  },
})
