import React from 'react'
import {Linking, StyleSheet, TouchableOpacity} from 'react-native'

import {Text} from '../../../../../components'
import {COLORS} from '../../../../../theme'
import {useStrings} from '../strings'

// TODO: replace with real link
const LEARN_MORE_LINK = 'https://google.com'

export const LearnMoreLink = () => {
  const strings = useStrings()

  const onPress = () => {
    Linking.openURL(LEARN_MORE_LINK)
  }

  return (
    <TouchableOpacity style={styles.root} onPress={onPress}>
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
