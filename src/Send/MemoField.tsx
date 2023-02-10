import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'

import {TextInput} from '../components'
import {COLORS} from '../theme'
import {useSend} from './Context/SendContext'

export const maxMemoLength = 256

export const MemoField = () => {
  const strings = useStrings()
  const {memo, memoChanged} = useSend()

  const showError = memo.length > maxMemoLength

  return (
    <View style={styles.container}>
      <TextInput
        value={memo}
        onChangeText={(memo) => memoChanged(memo.trim())}
        label={strings.label}
        autoComplete={false}
        testID="memoFieldInput"
        errorText={showError ? 'error' : undefined} // to show the error styling
        noErrors={true} // to block the default helper
        multiline={true}
      />

      <View style={styles.helper}>
        <Text style={[styles.warning, showError && styles.error]}>{showError ? strings.error : strings.warning}</Text>

        <Text style={[styles.counter, showError && styles.error]}>{`${memo.length}/${maxMemoLength}`}</Text>
      </View>
    </View>
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
    defaultMessage: '!!!Memo is name is too long',
  },
})

const styles = StyleSheet.create({
  container: {
    paddingBottom: 25,
  },
  helper: {
    paddingLeft: 10,
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  counter: {
    color: COLORS.TEXT_INPUT,
    fontSize: 12,
  },
  warning: {
    color: COLORS.TEXT_INPUT,
    fontSize: 12,
  },
  error: {
    color: COLORS.ERROR_TEXT_COLOR,
  },
})
