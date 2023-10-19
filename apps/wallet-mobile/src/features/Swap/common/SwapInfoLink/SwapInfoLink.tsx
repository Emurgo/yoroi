import React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity} from 'react-native'

import {useStrings} from '../strings'

const SWAP_ZENDESK_LINK = 'https://emurgohelpdesk.zendesk.com/hc/en-us/sections/8154256843407-Swap'

export const SwapInfoLink = () => {
  const strings = useStrings()
  return (
    <TouchableOpacity onPress={() => Linking.openURL(SWAP_ZENDESK_LINK)} style={styles.link}>
      <Text style={styles.linkText}>{strings.listOrdersSheetLink}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  link: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: '#4B6DDE',
    fontSize: 16,
    textDecorationLine: 'underline',
    lineHeight: 22,
  },
})
