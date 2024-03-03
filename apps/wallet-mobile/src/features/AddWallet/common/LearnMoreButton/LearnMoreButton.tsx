import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity} from 'react-native'

// import {useStrings} from '../common/useStrings'

type LearnMoreButtonProps = {
  onPress: () => void
}

export const LearnMoreButton = ({onPress}: LearnMoreButtonProps) => {
  const {styles} = useStyles()
  //   const strings = useStrings()

  return (
    <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
      <Text style={styles.text}>Learn more on Yoroi Zendesk</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    text: {
      fontFamily: 'Rubik',
      fontWeight: '400',
      fontSize: 16,
      lineHeight: 22,
      color: theme.color.primary[500],
      textDecorationLine: 'underline',
      alignSelf: 'center',
    },
  })

  const colors = {
    gray900: theme.color.gray[900],
  }

  return {styles, colors} as const
}
