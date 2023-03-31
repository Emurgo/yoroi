import * as React from 'react'
import {TouchableOpacity} from 'react-native'

export type EditAmountButtonProps = {
  onPress(): void
  children?: React.ReactNode
}

export const EditAmountButton = ({onPress, children}: EditAmountButtonProps) => {
  return (
    <TouchableOpacity style={{paddingVertical: 16}} onPress={onPress} testID="editAmountButton">
      {children}
    </TouchableOpacity>
  )
}
