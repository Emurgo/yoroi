import React from 'react'

import {useStrings} from '~/features/Send/common/useStrings'
import {TextInput, TextInputProps} from '~/ui/TextInput/TextInput'
import {ShowMemoErrorTooLong} from './ShowMemoErrorTooLong'
import {ShowMemoInstructions} from './ShowMemoInstructions'

export const InputMemo = ({
  isValid,
  value,
  ...props
}: {isValid?: boolean} & TextInputProps) => {
  const strings = useStrings()

  return (
    <TextInput
      value={value}
      label={strings.memoLabel}
      autoComplete="off"
      testID="memoFieldInput"
      error={isValid ? undefined : true}
      renderComponentStyle={{maxHeight: 80}}
      multiline
      focusable
      helper={
        isValid ? (
          <ShowMemoInstructions memo={value} />
        ) : (
          <ShowMemoErrorTooLong memo={value} />
        )
      }
      {...props}
    />
  )
}
