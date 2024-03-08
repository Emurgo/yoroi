import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity} from 'react-native'

import {useStrings} from '../../common/useStrings'

type LearnMoreButtonProps = {
  onPress: () => void
}

export const LearnMoreButton = ({onPress}: LearnMoreButtonProps) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
      <Text style={styles.text}>{strings.learnMoreButton}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    text: {
      ...theme.typography['link-1-l-underline'],
      color: theme.color.primary[500],
      alignSelf: 'center',
    },
  })
  return {styles} as const
}
