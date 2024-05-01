import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, StyleSheet, TouchableOpacity} from 'react-native'

import {Text} from '../../../../../components'
import {useStrings} from '../strings'

const LEARN_MORE_LINK = 'https://emurgohelpdesk.zendesk.com/hc/en-us/sections/8582793481231-Governance'

export const LearnMoreLink = () => {
  const strings = useStrings()
  const styles = useStyles()

  const handleOnPress = () => {
    Linking.openURL(LEARN_MORE_LINK)
  }

  if (LEARN_MORE_LINK.length === 0) return null

  return (
    <TouchableOpacity style={styles.root} onPress={handleOnPress}>
      <Text style={styles.link}>{strings.learnMoreAboutGovernance}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    link: {
      color: color.primary_c600,
      textDecorationLine: 'underline',
    },
  })

  return styles
}
