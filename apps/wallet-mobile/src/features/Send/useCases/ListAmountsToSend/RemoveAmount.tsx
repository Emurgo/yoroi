import * as React from 'react'
import {TouchableOpacity} from 'react-native'

import {Icon} from '../../../../components'
import {COLORS} from '../../../../theme'

export type RemoveAmountButtonProps = {
  onPress(): void
}

export const RemoveAmountButton = ({onPress}: RemoveAmountButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} testID="removeAmountButton">
      <Icon.Delete size={26} color={COLORS.BLACK} />
    </TouchableOpacity>
  )
}
