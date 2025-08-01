import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, TextProps} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'

export const NoBalance = ({style, ...props}: TextProps) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <Text
      style={[style, {color: p.sys_magenta_500, textAlign: 'center'}]}
      {...props}
    >
      {strings.send.noBalance}
    </Text>
  )
}
