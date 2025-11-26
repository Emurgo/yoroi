import * as React from 'react'
import {TextInput as RNTextInput} from 'react-native'

import {TextInput, TextInputProps} from '~/ui/TextInput/TextInput'

export type AddressInputBaseProps = {
  value: string
  onChangeText: (text: string) => void
  rightAdornment?: React.ReactNode
  helper?: React.ReactNode
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'right' | 'helper'>

export const AddressInputBase = React.forwardRef<
  RNTextInput,
  AddressInputBaseProps
>(
  (
    {value, onChangeText, rightAdornment, helper, ...props},
    ref: React.ForwardedRef<RNTextInput>,
  ) => {
    return (
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        right={rightAdornment}
        helper={helper}
        {...props}
      />
    )
  },
)

AddressInputBase.displayName = 'AddressInputBase'
