import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {useStrings} from '../useStrings'

export const LearnMoreButton = ({activeOpacity = 0.5, ...props}: TouchableOpacityProps) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <TouchableOpacity activeOpacity={activeOpacity} {...props}>
      <Text style={{...styles.text, textDecorationLine: 'none'}}>{strings.learnMore}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    text: {
      ...atoms.link_1_lg_underline,
      color: color.primary_500,
      alignSelf: 'center',
    },
  })
  return {styles}
}
