import * as React from 'react'
import {StyleSheet, Text, TextProps} from 'react-native'

import {COLORS} from '../../../../../../theme/config'
import {useStrings} from '../../../../common/strings'

export const NoBalance = ({style, ...props}: TextProps) => {
  const strings = useStrings()

  return (
    <Text style={[style, styles.noBalance]} {...props}>
      {strings.noBalance}
    </Text>
  )
}

const styles = StyleSheet.create({
  noBalance: {
    color: COLORS.ERROR_TEXT_COLOR,
    textAlign: 'center',
  },
})
