import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TextProps} from 'react-native'

import {useStrings} from '../../../../common/strings'

export const NoBalance = ({style, ...props}: TextProps) => {
  const strings = useStrings()
  const styles = useStyles()

  return (
    <Text style={[style, styles.noBalance]} {...props}>
      {strings.noBalance}
    </Text>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    noBalance: {
      color: color.magenta[500],
      textAlign: 'center',
    },
  })

  return styles
}
