import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {useStrings} from '../useStrings'

export const LearnMoreButton = ({activeOpacity = 0.5, ...props}: TouchableOpacityProps) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <TouchableOpacity activeOpacity={activeOpacity} {...props}>
      <Text style={styles.text}>{strings.learnMore}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    text: {
      ...theme.typography['link-1-l-underline'],
      color: theme.color.primary_c500,
      alignSelf: 'center',
    },
  })
  return {styles} as const
}
