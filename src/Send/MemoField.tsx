import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'

import {TextInput} from '../components'
import {COLORS} from '../theme'

const maxMemoValue = 256

export const MemoField = () => {
  const [memo, setMemo] = React.useState('')
  const strings = useStrings()

  return (
    <View style={styles.container}>
      <TextInput
        value={memo}
        onChangeText={setMemo}
        label={strings.label}
        autoComplete={false}
        testID="memoFieldInput"
        noErrors={true}
      />

      <View style={styles.helper}>
        <Text style={styles.warning}>{strings.warning}</Text>

        <Text style={styles.counter}>{`/${maxMemoValue}`}</Text>
      </View>
    </View>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    label: intl.formatMessage(messages.label),
    warning: intl.formatMessage(messages.warning),
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
})

const styles = StyleSheet.create({
  container: {
    paddingBottom: 25,
  },
  helper: {
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
})
