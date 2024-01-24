import React from 'react'
import {Linking, StyleSheet, TouchableOpacity} from 'react-native'

import {Text} from '../../../../../components'
import {COLORS} from '../../../../../theme'
import {useStrings} from '../strings'

const LEARN_MORE_LINK = ''

export const LearnMoreLink = () => {
  const strings = useStrings()

  const handleOnPress = () => {
    Linking.openURL(LEARN_MORE_LINK)
  }

  if (LEARN_MORE_LINK.length === 0) return null

  return (
    <TouchableOpacity style={styles.root} onPress={handleOnPress}>
      <Text style={styles.blueText}>{strings.learnMoreAboutGovernance}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueText: {
    color: COLORS.SHELLEY_BLUE,
    textDecorationLine: 'underline',
  },
})
