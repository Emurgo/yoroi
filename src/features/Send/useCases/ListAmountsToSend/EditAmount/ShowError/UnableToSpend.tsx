import * as React from 'react'
import {StyleSheet, Text, TextProps} from 'react-native'

import {COLORS} from '../../../../../../theme/config'
import {useStrings} from '../../../../common/strings'

export const UnableToSpend = ({style, ...props}: TextProps) => {
  const strings = useStrings()

  return (
    <Text style={[style, styles.overSpendable]} {...props}>
      {strings.minPrimaryBalanceForTokens}
    </Text>
  )
}

const styles = StyleSheet.create({
  overSpendable: {
    color: COLORS.TEXT_INPUT,
    textAlign: 'center',
  },
})
