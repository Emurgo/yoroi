import React from 'react'
import {StyleSheet} from 'react-native'

import {TextInput, TextInputProps} from '../../../../../components/TextInput/TextInput'
import {useStrings} from '../../../common/strings'
import {ShowMemoErrorTooLong} from './ShowMemoErrorTooLong'
import {ShowMemoInstructions} from './ShowMemoInstructions'

export const InputMemo = ({isValid, value, ...props}: {isValid?: boolean} & TextInputProps) => {
  const strings = useStrings()

  return (
    <TextInput
      value={value}
      label={strings.memoLabel}
      autoComplete="off"
      testID="memoFieldInput"
      error={isValid ? undefined : true}
      renderComponentStyle={styles.input}
      multiline
      focusable
      helper={isValid ? <ShowMemoInstructions memo={value} /> : <ShowMemoErrorTooLong memo={value} />}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    maxHeight: 80,
  },
})
