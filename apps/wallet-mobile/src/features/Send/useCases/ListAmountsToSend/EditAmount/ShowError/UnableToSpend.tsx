import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TextProps} from 'react-native'

import {useStrings} from '../../../../common/strings'

export const UnableToSpend = ({style, ...props}: TextProps) => {
  const strings = useStrings()
  const styles = useStyles()

  return (
    <Text style={[style, styles.overSpendable]} {...props}>
      {strings.minPrimaryBalanceForTokens}
    </Text>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    overSpendable: {
      color: color.gray_c600,
      textAlign: 'center',
    },
  })
  return styles
}
