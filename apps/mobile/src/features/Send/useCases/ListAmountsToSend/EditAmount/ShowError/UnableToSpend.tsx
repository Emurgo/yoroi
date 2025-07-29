import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, TextProps} from 'react-native'

import {useStrings} from '~/features/Send/common/useStrings'

export const UnableToSpend = ({style, ...props}: TextProps) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <Text style={[style, {color: p.gray_600, textAlign: 'center'}]} {...props}>
      {strings.minPrimaryBalanceForTokens}
    </Text>
  )
}
